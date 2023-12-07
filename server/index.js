const express = require("express");
const bodyParser = require("body-parser");
const next = require("next");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const stringSimilarity = require("string-similarity");
const { getServerSession, getSession } = require("next-auth/react");
const { getToken } = require("next-auth/jwt");
require("dotenv").config({ path: ".env.local" });
const { sendEmailVerification } = require("firebase/auth");

const auth = require("next-auth");

const dev = process.env.NODE_ENV !== "production";
const server = next({ dev });
const handle = server.getRequestHandler();

const { MongoClient } = require("mongodb");
const { info } = require("autoprefixer");

const admin = require("firebase-admin");
const serviceAccount = require("./myherolist-79db9-firebase-adminsdk-f1d7h-14429787c5.json"); // Your Firebase service account key

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
console.log("Connected to MongoDB");

const database = client.db("Heroes");
const infodb = database.collection("info");
const powersdb = database.collection("powers");
const userdb = database.collection("user");
const policydb = database.collection("policies");
const jwt = require("jsonwebtoken");

// Define the Joi schema for search pattern input validation
const searchSchema = Joi.object({
  field: Joi.string().valid("name", "Race", "Publisher", "power").required(),
  pattern: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9! ]*$"))
    .message("Pattern must not contain special characters except '!'")
    .required(),
  n: Joi.number().integer().min(0).allow("", null).optional(),
});

// Middleware to authenticate users based on JWT token
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1]; // Extract the token from the header

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      req.user = decoded;
      next(); // User is authenticated, proceed to the next middleware
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

// Define the Joi schema for power input validation
const powerSchema = Joi.object({
  power: Joi.string()
    .pattern(/^[a-zA-Z0-9 ]+$/) // Allows letters, numbers, and spaces
    .required()
    .messages({
      "string.pattern.base": `"power" must only contain letters, numbers, and spaces`,
    }),
  n: Joi.number().integer().min(0).allow("", null).optional(),
});

// Define the Joi schema for hero id input validation
const idSchema = Joi.object({
  id: Joi.number().integer().min(0).max(733).required(),
});

// Define the Joi schema for list name input validation
// This would disallow < and > characters to prevent HTML manipulation
const listnameSchema = Joi.object({
  listname: Joi.string()
    .trim()
    .regex(/^[^<>]+$/)
    .required()
    .messages({
      "string.pattern.base": `"listname" must not contain HTML elements or other potentially harmful characters`,
    }),
});

// Define the Joi schema for hero addition to list name input validation
const addHeroSchema = Joi.object({
  heroes: Joi.array()
    .items(Joi.number().integer().min(0).max(733))
    .required()
    .messages({
      "array.base": `"heroes" must be an array of hero IDs`,
      "number.base": `"heroes" must only contain numbers`,
      "number.min": `Hero IDs must be greater than or equal to 0`,
      "number.max": `Hero IDs must be less than or equal to 733`,
    }),
});

// Define the middleware for input sanitization
const validateRequest = (schema) => {
  return (req, res, next) => {
    const dataToValidate = { ...req.params, ...req.query, ...req.body };
    const { error } = schema.validate(dataToValidate);
    if (error) {
      console.log(error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

const validateAddToList = (body, params) => {
  return (req, res, next) => {
    if (params) {
      const paramsValidation = params.validate(req.params);
      if (paramsValidation.error) {
        return res
          .status(400)
          .json({ error: paramsValidation.error.details[0].message });
      }
    }

    if (body) {
      const bodyValidation = body.validate(req.body);
      if (bodyValidation.error) {
        return res
          .status(400)
          .json({ error: bodyValidation.error.details[0].message });
      }
    }

    next();
  };
};

server
  .prepare()
  .then(() => {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Fetches the policies for the website from MongoDB
    app.get("/api/policy", async (req, res) => {
      try {
        const policy = await policydb.findOne({});
        console.log(policy.policy);
        res.json(policy.policy);
      } catch (err) {
        res.status(500).send("Error fetching policy");
      }
    });

    app.post("/api/resendVerificationEmail", async (req, res) => {
      const { email } = req.body;

      try {
        const user = await admin.auth().getUserByEmail(email);
        await sendEmailVerification(user);
        res.status(200).send("Verification email resent successfully.");
      } catch (error) {
        console.error("Error resending verification email:", error);
        res.status(500).send("Error resending verification email.");
      }
    });

    // Searches heroes based on combination of Power, Name, Publisher, and Race
    app.get("/api/heroes/search", async (req, res) => {
      try {
        let heroes = await infodb.find({}).toArray();

        if (req.query.Power) {
          const powerQuery = { [req.query.Power]: "True" };
          const powerCursor = powersdb.find(powerQuery);
          const powerResults = await powerCursor.toArray();
          const heroesWithSpecifiedPower = powerResults.map(
            (doc) => doc.hero_names
          );
          heroes = heroes.filter((hero) =>
            heroesWithSpecifiedPower.includes(hero.name)
          );
        }

        ["name", "Race", "Publisher"].forEach((field) => {
          if (req.query[field]) {
            const searchString = req.query[field].toLowerCase();
            heroes = heroes.filter((hero) => {
              const fieldValue = hero[field] ? hero[field].toLowerCase() : "";
              const beginningOfField = fieldValue.substring(
                0,
                searchString.length
              );
              return (
                stringSimilarity.compareTwoStrings(
                  searchString,
                  beginningOfField
                ) > 0.47
              );
            });
          }
        });

        for (let i = 0; i < heroes.length; i++) {
          // Query for each hero's powers
          const heroPowersCursor = powersdb.find({
            hero_names: heroes[i].name,
          });
          const heroPowersResult = await heroPowersCursor.toArray();

          if (heroPowersResult.length > 0) {
            const powers = heroPowersResult[0];
            // Filter and add powers set to "True"
            heroes[i].powers = Object.keys(powers).filter(
              (power) =>
                powers[power] === "True" &&
                power !== "hero_names" &&
                power !== "_id"
            );
          } else {
            heroes[i].powers = []; // No powers found for this hero
          }

          const heroNameEncoded = encodeURIComponent(heroes[i].name);
          const imgRes = await fetch(
            `https://superheroapi.com/api/6817922361577086/search/${heroNameEncoded}`
          );
          const imgData = await imgRes.json();

          if (imgData.results && imgData.results.length > 0) {
            heroes[i].image = imgData.results[0].image.url;
          } else {
            heroes[i].image = null;
          }
        }

        return res.json(heroes);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Retrieves all possible powers that exist
    app.get("/api/powers", async (req, res) => {
      const doc = await powersdb.findOne({});
      const fields = Object.keys(doc).filter(
        (key) => key !== "_id" && key !== "hero_names"
      );
      //console.log(fields);

      return res.json(fields);
    });

    // Retrieves heroes based on power
    app.get(
      "/api/powers/:power",
      validateRequest(powerSchema),
      async (req, res) => {
        let power = req.params.power;
        const n = req.query.n ? parseInt(req.query.n, 10) : Infinity;

        try {
          const powersCursor = powersdb.find({ [power]: "True" }).limit(n);
          const powersMatched = await powersCursor.toArray();

          if (powersMatched.length === 0) {
            return res
              .status(404)
              .json({ message: "Hero with given power not found!" });
          }

          // Query the infodb collection for each hero
          const heroes = await Promise.all(
            powersMatched.map(async (p) => {
              const heroInfo = await infodb.findOne({ name: p.hero_names });
              return (
                heroInfo || {
                  name: p.hero_names,
                  message: "Hero details not found",
                }
              );
            })
          );

          return res.json(heroes);
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    );

    // Gets hero information based on provided hero id, incluing hero images
    app.get("/api/heroes/:id", validateRequest(idSchema), async (req, res) => {
      const id = parseInt(req.params.id);

      const hero = await infodb.findOne({ id: id });
      console.log("Reached");

      if (!hero) {
        return res.status(404).json({ message: "Hero not found!" });
      }

      const heroName = hero.name;
      const heroNameEncoded = encodeURIComponent(heroName);

      const imgRes = await fetch(
        `https://superheroapi.com/api/6817922361577086/search/${heroNameEncoded}`
      );
      const imgData = await imgRes.json();

      // Extract the image URL from the response
      const imageUrl = imgData.results[0].image.url; // Make sure to handle cases where this might not exist

      const powers = await powersdb.findOne({ hero_names: heroName });

      if (powers) {
        const powersResult = Object.entries(powers)
          .filter(
            ([power, value]) =>
              value === "True" && power !== "hero_names" && power !== "_id"
          )
          .map(([power]) => power);

        const heroWithPowersAndImage = {
          ...hero,
          powers: powersResult,
          image: imageUrl,
        };
        console.log(heroWithPowersAndImage);
        return res.json(heroWithPowersAndImage);
      }

      return res.json(hero);
    });

    // Fetches powers based on input hero_id
    app.get(
      "/api/heroes/:id/powers",
      validateRequest(idSchema),
      async (req, res) => {
        const id = parseInt(req.params.id);
        const hero = await infodb.findOne({ id: id });

        if (hero) {
          const heroName = hero.name;

          const powers = await powersdb.findOne({ hero_names: heroName });

          if (powers) {
            const powersResult = Object.entries(powers)
              .filter(
                ([power, value]) =>
                  value === "True" && power !== "hero_names" && power !== "_id"
              )
              .map(([power]) => power);

            return res.json(powersResult);
          }
          return res
            .status(404)
            .json({ message: "Powers for given hero not found!" });
        }
        return res.status(404).json({ message: "Hero not found!" });
      }
    );

    // Checks if a user with the email already exists
    app.get("/api/user", async (req, res) => {
      try {
        const { email } = req.body;
        const exists = await userdb.findOne({ email });
        console.log(exists);
        if (exists) {
          return res.json({
            msg: "Uh-oh, an account with this email already exists!",
          });
        }

        res.status(201).json({ msg: "Success" });
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Error");
      }
    });

    // Retrieves all users on the platform
    app.get("/api/users", authenticate, async (req, res) => {
      console.log("Hey");
      console.log(req.user);
      try {
        if (req.user.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }

        const users = await userdb.find({}).toArray();
        res.status(200).json(users);
      } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving users");
      }
    });

    // Endpoint to disable users
    app.put("/api/users/disable", authenticate, async (req, res) => {
      console.log("Hey");
      console.log(req.user);
      try {
        if (req.user.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }

        const { userEmail } = req.body;
        console.log("Reached");
        const user = await userdb.findOne({ email: userEmail });
        const firebaseRecord = await admin.auth().getUserByEmail(userEmail);
        const uid = firebaseRecord.uid;
        console.log(user);

        if (user.disabled === false) {
          await admin.auth().updateUser(uid, { disabled: true });
          // Update the 'disabled' field in the MongoDB document
          const result = await userdb.updateOne(
            { email: userEmail },
            { $set: { disabled: true } }
          );

          if (result.modifiedCount === 0) {
            return res
              .status(404)
              .json({ message: "User not found in MongoDB" });
          }
        } else if (user.disabled === true) {
          await admin.auth().updateUser(uid, { disabled: false });
          // Update the 'disabled' field in the MongoDB document
          const result = await userdb.updateOne(
            { email: userEmail },
            { $set: { disabled: false } }
          );

          if (result.modifiedCount === 0) {
            return res
              .status(404)
              .json({ message: "User not found in MongoDB" });
          }
        }

        res.status(200).json({ message: "Success!" });
      } catch (err) {
        console.error(err);
        res.status(500).send("Error disabling user");
      }
    });

    // Endpoint to give users admin privelages
    app.put("/api/users/admin", authenticate, async (req, res) => {
      console.log("Hey");
      console.log(req.user);
      try {
        if (req.user.role !== "admin") {
          return res.status(403).json({ message: "Access denied" });
        }

        const { userEmail } = req.body;
        console.log("Reached");
        const user = await userdb.findOne({ email: userEmail });

        console.log(user);

        const result = await userdb.updateOne(
          { email: userEmail },
          { $set: { role: "admin" } }
        );

        res.status(200).json({ message: "Success!" });
      } catch (err) {
        console.error(err);
        res.status(500).send("Error giving user admin");
      }
    });

    // Registers a valid user to MongoDB
    app.post("/api/user/register", async (req, res) => {
      try {
        const { email, username } = req.body;
        const exists = await userdb.findOne({ email });
        if (exists) {
          return res
            .status(400)
            .json({ msg: "Uh-oh, an account with this email already exists!" });
        }

        const newUser = {
          email: email,
          username: username,
          lists: [],
          role: "regular",
          disabled: false,
        };
        await userdb.insertOne(newUser);

        res.status(201).json({ msg: "Success" });
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Error");
      }
    });

    // All recent lists sorted by last modified, and that are public
    // This shows upto 10 lists, for unauthenticated users
    app.get("/api/lists/recent", async (req, res) => {
      try {
        // Aggregate the lists from all documents, sort them by lastModified, and limit to 10
        const recentLists = await userdb
          .aggregate([
            { $unwind: "$lists" }, // Deconstructs the lists array
            { $match: { "lists.public": true } }, // Only include documents where lists.public is true
            { $sort: { "lists.lastModified": -1 } }, // Sorts by lastModified in descending order
            { $limit: 10 }, // Limits to the 10 most recent
            { $project: { _id: 0, lists: 1, username: 1 } }, // Project only the lists field
          ])
          .toArray();

        // Extracting the lists from the aggregation result
        const lists = recentLists.map((item) => ({
          ...item.lists,
          username: item.username,
        }));

        res.status(200).json(lists);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // Gives lists that are created by the session's user only
    app.get("/api/lists/auth/mylists", authenticate, async (req, res) => {
      const email = req.user.email;
      console.log(email);
      try {
        if (!email) {
          return res.status(400).json({ message: "No email was found." });
        }
        const doc = await userdb.findOne(
          { email: email },
          { projection: { _id: 0, lists: 1, username: 1 } }
        );
        if (!doc) {
          return res.status(400).json({ message: "User not found." });
        }
        const listsWithUsername = doc.lists.map((list) => ({
          ...list,
          username: doc.username,
        }));
        console.log(listsWithUsername);
        res.status(200).json(listsWithUsername);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // All recent lists sorted by last modified, and that are public
    // This shows upto 20 lists, for authenticated users
    app.get("/api/lists/auth/recent", authenticate, async (req, res) => {
      try {
        // Aggregate the lists from all documents, sort them by lastModified, and limit to 20
        const recentLists = await userdb
          .aggregate([
            { $unwind: "$lists" }, // Deconstructs the lists array
            { $match: { "lists.public": true } }, // Only include documents where lists.public is true
            { $sort: { "lists.lastModified": -1 } }, // Sorts by lastModified in descending order
            { $limit: 20 }, // Limits to the 10 most recent
            { $project: { _id: 0, lists: 1, username: 1 } }, // Project only the lists field
          ])
          .toArray();

        // Extracting the lists from the aggregation result
        const lists = recentLists.map((item) => ({
          ...item.lists,
          username: item.username,
        }));

        res.status(200).json(lists);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.get("/api/lists/:listname", async (req, res) => {
      const listname = req.params.listname;
      try {
        // Find a document with the specified listname
        const query = { lists: { $elemMatch: { name: listname } } };
        const doc = await userdb.findOne(query);

        if (doc) {
          const list = doc.lists.find((list) => list.name === listname);
          console.log(list);
          const username = doc.username;
          const item = { ...list, username };
          res.status(200).json(item);
        } else {
          res.status(500).json({ message: "Listname not found." });
        }
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.post("/api/lists/create", authenticate, async (req, res) => {
      const { listname } = req.body;
      const { description } = req.body;
      const { review } = req.body;
      const { heroes } = req.body;
      const { public } = req.body;

      if (!listname || listname === "") {
        return res.status(400).json({ error: "No name was provided!" });
      }

      try {
        const userEmail = req.user.email;

        // Retrieve the user's data from the database
        const userData = await userdb.findOne({ email: userEmail });

        // Check if the user already has 20 or more lists
        if (userData.lists && userData.lists.length >= 20) {
          return res
            .status(400)
            .json({ error: "You cannot create more than 20 lists." });
        }

        // Check if a list with the same name already exists
        const existingList = await userdb.findOne({ "lists.name": listname });

        if (existingList) {
          return res
            .status(400)
            .json({ message: "A list with the name already exists!" });
        }

        const currentTime = new Date();

        await userdb.updateOne(
          { email: userEmail },
          {
            $push: {
              lists: {
                name: listname,
                heroes: heroes,
                public: public,
                description: description,
                review: review,
                lastModified: currentTime,
              },
            },
          }
        );

        return res
          .status(200)
          .json({ message: "List was created successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.put("/api/lists/:listname/update", authenticate, async (req, res) => {
      const oldListname = req.params.listname;
      const email = req.user.email;
      const { newListname, description, heroAdds, heroRemoves, public } =
        req.body;
      try {
        // Check if a list with the new name already exists across all users (if the name is being changed)
        if (newListname && newListname !== oldListname) {
          const existingList = await userdb.findOne({
            "lists.name": newListname,
          });
          if (existingList) {
            return res.status(400).json({
              message: "A list with the new name already exists across users!",
            });
          }
        }

        // Find the document that needs to be updated
        const userDocument = await userdb.findOne({
          email: email,
          "lists.name": oldListname,
        });
        if (!userDocument) {
          return res.status(404).json({ message: "List not found" });
        }

        // Modify the lists array as needed
        userDocument.lists = userDocument.lists.map((list) => {
          if (list.name === oldListname) {
            // Remove heroes if needed
            if (heroRemoves && heroRemoves.length) {
              list.heroes = list.heroes.filter(
                (heroId) => !heroRemoves.includes(heroId)
              );
            }

            // Apply other updates
            if (newListname) list.name = newListname;
            if (description !== undefined) list.description = description;
            if (public !== undefined) list.public = public;
            list.lastModified = new Date();

            // Add heroes if needed
            if (heroAdds && heroAdds.length) {
              list.heroes = [...new Set([...list.heroes, ...heroAdds])]; // This adds heroes without duplication
              list.lastModified = new Date();
            }
          }
          return list;
        });

        // Perform a single update operation
        await userdb.updateOne(
          { email: email },
          { $set: { lists: userDocument.lists } }
        );

        res.status(200).json({ message: "List updated successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.delete("/api/lists/:listname", authenticate, async (req, res) => {
      const listname = req.params.listname;

      try {
        // Find the document that contains the list to be deleted
        const existingList = await userdb.findOne({ "lists.name": listname });
        if (!existingList) {
          return res.status(404).json({ message: "List not found" });
        }

        // Remove the list from the document
        const result = await userdb.updateOne(
          { _id: existingList._id },
          { $pull: { lists: { name: listname } } }
        );
        if (result.modifiedCount === 0) {
          return res.status(400).json({ message: "List could not be deleted" });
        }
        res.status(200).json({ message: "List deleted successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.put("/api/lists/:listname/review", authenticate, async (req, res) => {
      const listname = req.params.listname;
      const { rating, comment, hidden } = req.body;

      // Validate the input
      if (
        typeof rating !== "number" ||
        rating < 0 ||
        rating > 5 ||
        typeof comment !== "string"
      ) {
        return res.status(400).json({
          message:
            "Rating must be a number between 0 and 5 and a valid comment is required.",
        });
      }

      try {
        const review = { rating, comment, hidden }; // Construct the review object

        // Push the new review object into the review array of the specified list
        const result = await userdb.updateOne(
          { "lists.name": listname },
          { $push: { "lists.$.review": review } }
        );

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: "List not found or no update required" });
        }

        res.status(200).json({ message: "Review added successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.put(
      "/api/lists/:listname/review/hide",
      authenticate,
      async (req, res) => {
        try {
          if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
          }

          const listName = req.params.listname;
          const { reviewIndex } = req.body;

          // Fetch the entire document

          const userDocument = await userdb.findOne({ "lists.name": listName });
          //console.log(userDocument);
          if (!userDocument) {
            return res.status(404).json({ message: "List not found" });
          }

          // Find the desired list and review
          const list = userDocument.lists.find((l) => l.name === listName);
          //console.log(list);
          if (!list || !list.review || list.review.length <= reviewIndex) {
            return res.status(404).json({ message: "Review not found" });
          }
          console.log(list.review[0].hidden);
          // Toggle the hidden field
          list.review[reviewIndex].hidden = !list.review[reviewIndex].hidden;

          console.log("HERERERE");
          console.log(list.review[reviewIndex]);

          // Update the document in MongoDB
          await userdb.updateOne(
            { _id: userDocument._id },
            { $set: { lists: userDocument.lists } }
          );

          res
            .status(200)
            .json({ message: "Review hidden status toggled successfully" });
        } catch (err) {
          console.error("Error toggling hidden status:", err.message);
          res.status(500).send("Error toggling hidden status");
        }
      }
    );

    app.get("*", (req, res) => {
      return handle(req, res);
    });

    app.post("/api/auth/*", (req, res) => {
      return handle(req, res);
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server listening on port ${process.env.PORT}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
