const express = require("express");
const bodyParser = require("body-parser");
const next = require("next");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const auth = require("next-auth");

const dev = process.env.NODE_ENV !== "production";
const server = next({ dev });
const handle = server.getRequestHandler();

const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://admin:hello234@cluster0.qhj8gpn.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
console.log("Connected to MongoDB");

const database = client.db("Heroes");
const infodb = database.collection("info");
const powersdb = database.collection("powers");
const userdb = database.collection("user");

// Define the Joi schema for search pattern input validation
const searchSchema = Joi.object({
  field: Joi.string().valid("name", "Race", "Publisher", "power").required(),
  pattern: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9! ]*$"))
    .message("Pattern must not contain special characters except '!'")
    .required(),
  n: Joi.number().integer().min(0).allow("", null).optional(),
});

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

    // Get the n number of matching superhero based on field and its pattern
    app.get(
      "/api/heroes/search",
      validateRequest(searchSchema),
      async (req, res) => {
        const { field, pattern, n } = req.query;

        if (!field || !pattern) {
          return res
            .status(400)
            .json({ error: "Field and pattern queries must be provided." });
        }

        try {
          const regex = new RegExp(pattern, "i");
          const query = { [field]: regex };

          const cursor = infodb.find(query).sort({ id: 1 });

          if (n) {
            cursor.limit(parseInt(n, 10));
          }

          const results = await cursor.toArray();

          if (results.length == 0) {
            throw Error("No matches found!");
          }
          const ids = results.map((h) => h.id);
          return res.json(ids);
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    );

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

      if (!hero) {
        return res.status(404).json({ message: "Hero not found!" });
      }

      const heroName = hero.name;

      const powers = await powersdb.findOne({ hero_names: heroName });

      if (powers) {
        const powersResult = Object.entries(powers)
          .filter(
            ([power, value]) =>
              value === "True" && power !== "hero_names" && power !== "_id"
          )
          .map(([power]) => power);

        const heroWithPowers = {
          ...hero,
          powers: powersResult,
        };
        return res.json(heroWithPowers);
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

    app.post("/api/user/register", async (req, res) => {
      try {
        const { email, username } = req.body;
        console.log("Reached");
        const exists = await userdb.findOne({ email });
        if (exists) {
          return res
            .status(400)
            .json({ msg: "Uh-oh, an account with this email already exists!" });
        }

        const newUser = {
          email: email,
          username: username,
        };
        await userdb.insertOne(newUser);

        res
          .status(201)
          .json({ msg: "User successfully registered! Enjoy exploring." });
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

    // Post a new list with the provided name, if possible
    app.post(
      "/api/mylists",
      validateRequest(listnameSchema),
      async (req, res) => {
        const { listname } = req.body;

        if (!listname || listname === "") {
          return res.status(400).json({ error: "No name was provided!" });
        }

        try {
          // Check if a list with the same name already exists
          const existingList = await userdb.findOne({ name: listname });

          if (existingList) {
            return res
              .status(400)
              .json({ message: "A list with the name already exists!" });
          }

          // Insert the new list
          await userdb.insertOne({ name: listname, heroes: [] });

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
