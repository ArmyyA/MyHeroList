const express = require("express");
const bodyParser = require("body-parser");
const next = require("next");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const stringSimilarity = require("string-similarity");
const { getServerSession, getSession } = require("next-auth/react");
const { getToken } = require("next-auth/jwt");

const auth = require("next-auth");

const dev = process.env.NODE_ENV !== "production";
const server = next({ dev });
const handle = server.getRequestHandler();

const { MongoClient } = require("mongodb");
const { info } = require("autoprefixer");

const uri =
  "mongodb+srv://admin:hello234@cluster0.qhj8gpn.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
console.log("Connected to MongoDB");

const database = client.db("Heroes");
const infodb = database.collection("info");
const powersdb = database.collection("powers");
const userdb = database.collection("user");
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
                ) > 0.5
              ); // Adjust threshold as needed
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

    // Gets hero information based on provided hero id
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

    // Retrieves all possible publishers
    app.get("/api/publishers", async (req, res) => {
      try {
        const aggregationPipeline = [
          {
            $match: {
              Publisher: { $exists: true, $ne: "" },
            },
          },
          {
            $group: {
              _id: "$Publisher",
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ];

        const result = await infodb.aggregate(aggregationPipeline).toArray();
        const publishers = result.map((doc) => doc._id);

        console.log(publishers);
        return res.json(publishers);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

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
        };
        await userdb.insertOne(newUser);

        res.status(201).json({ msg: "Success" });
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Error");
      }
    });

    // Retrieves all the lists
    app.get("/api/mylists", async (req, res) => {
      try {
        // Query the userdb collection and project only the 'name' field
        const cursor = userdb.find({}).project({ name: 1, _id: 0 });
        const lists = await cursor.toArray();

        if (lists.length === 0) {
          return res.status(400).json({ message: "No Lists Found" });
        } else {
          // Extract just the names from the documents
          const listNames = lists.map((list) => list.name);
          return res.json(listNames);
        }
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

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

    app.get("/api/lists/auth/recent", authenticate, async (req, res) => {
      try {
        // Aggregate the lists from all documents, sort them by lastModified, and limit to 10
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
      const { rating } = req.body;
      const { heroes } = req.body;
      const { public } = req.body;

      if (!listname || listname === "") {
        return res.status(400).json({ error: "No name was provided!" });
      }

      try {
        const userEmail = req.user.email;
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
                rating: rating,
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

        // Prepare the update objects
        let setOps = {};
        let addToSetOps = {};

        if (newListname !== undefined) setOps["lists.$.name"] = newListname;
        if (description !== undefined)
          setOps["lists.$.description"] = description;
        if (public !== undefined) setOps["lists.$.public"] = public;

        if (heroAdds && heroAdds.length) {
          addToSetOps["lists.$.heroes"] = { $each: heroAdds };
        }

        // Update the list with new fields and add heroes
        await userdb.updateOne(
          { email: email, "lists.name": oldListname },
          {
            ...(Object.keys(setOps).length > 0 && { $set: setOps }),
            ...(Object.keys(addToSetOps).length > 0 && {
              $addToSet: addToSetOps,
            }),
            $currentDate: { "lists.$.lastModified": true },
          }
        );

        // If there are heroes to remove
        if (heroRemoves && heroRemoves.length) {
          await userdb.updateOne(
            { email: email, "lists.name": oldListname },
            {
              $pullAll: { "lists.$.heroes": heroRemoves },
              $currentDate: { "lists.$.lastModified": true },
            }
          );
        }

        res.status(200).json({ message: "List updated successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // Post a new list with the provided name, if possible
    app.post(
      "/api/mylists",
      validateRequest(listnameSchema),
      async (req, res) => {
        const { listname } = req.body;
        const { description } = req.body;
        const { rating } = req.body;

        if (!listname || listname === "") {
          return res.status(400).json({ error: "No name was provided!" });
        }

        try {
          const userEmail = req.user.email;
          // Check if a list with the same name already exists
          const existingList = await userdb.findOne({ "lists.name": listname });

          if (existingList) {
            return res
              .status(400)
              .json({ message: "A list with the name already exists!" });
          }

          await userdb.updateOne(
            { email: userEmail },
            {
              $push: {
                lists: {
                  name: listname,
                  heroes: [],
                  description: description,
                  rating: rating,
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
      }
    );

    // Put new heroes list within a given listname
    app.put(
      "/api/mylists/:listname",
      validateAddToList(addHeroSchema, listnameSchema),
      async (req, res) => {
        const listname = req.params.listname;
        const heroids = req.body.heroes;

        if (!Array.isArray(heroids)) {
          return res
            .status(400)
            .json({ message: "Provided body list is not valid!" });
        }

        try {
          const list = await userdb.findOne({ name: listname });

          // If the list does not exist return 404
          if (!list) {
            return res.status(404).json({ message: "List not found." });
          }

          const heroesCount = await infodb.countDocuments({
            id: { $in: heroids },
          });
          if (heroesCount !== heroids.length) {
            return res
              .status(400)
              .json({ message: "One or more hero IDs do not exist." });
          }

          // Update the list with new hero IDs
          await userdb.updateOne(
            { name: listname },
            { $set: { heroes: heroids } }
          );

          return res
            .status(200)
            .json({ message: "Superhero list was updated successfully!" });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    );

    // Get contents of the list given listname
    app.get(
      "/api/mylists/:listname",
      validateRequest(listnameSchema),
      async (req, res) => {
        const listname = req.params.listname;

        const list = await userdb.findOne({ name: listname });

        // If the list does not exist return 404
        if (!list) {
          return res.status(404).json({ message: "List not found." });
        }

        return res.json(list.heroes);
      }
    );

    // Delete a list given listname
    app.delete(
      "/api/mylists/:listname",
      validateRequest(listnameSchema),
      async (req, res) => {
        try {
          const listname = req.params.listname;

          const list = await userdb.findOne({ name: listname });

          // If the list does not exist return 404
          if (!list) {
            return res.status(404).json({ message: "List not found." });
          }

          await userdb.deleteOne({ name: listname });

          res.status(200).json({ message: "List deleted successfully!" });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    );

    // Retrieves all heroes and their content given a list name
    app.get("/api/mylists/:listName/heroes", async (req, res) => {
      const { listName } = req.params;

      try {
        // Find the list with the given name
        const list = await userdb.findOne({ name: listName });

        // If the list doesn't exist, return an error
        if (!list) {
          return res.status(404).json({ message: "List not found" });
        }

        // Retrieve details for each superhero in the list
        const heroesDetails = await Promise.all(
          list.heroes.map(async (id) => {
            const hero = await infodb.findOne({ id: id });
            if (!hero) return null;

            const heroPowers = await powersdb.findOne({
              hero_names: hero.name,
            });
            let powersResult = [];

            if (heroPowers) {
              powersResult = Object.entries(heroPowers)
                .filter(
                  ([power, value]) =>
                    value === "True" &&
                    power !== "hero_names" &&
                    power !== "_id"
                )
                .map(([power]) => power);
            }

            // Combine hero information and powers
            return {
              ...hero,
              powers: powersResult,
            };
          })
        );

        // Filter out any null values (in case some heroes were not found)
        const filteredHeroesDetails = heroesDetails.filter(
          (hero) => hero !== null
        );

        // Respond with the details
        res.json(filteredHeroesDetails);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    app.get("*", (req, res) => {
      return handle(req, res);
    });

    app.post("/api/auth/*", (req, res) => {
      return handle(req, res);
    });

    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
