const express = require("express");
const bodyParser = require("body-parser");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://admin:hello234@cluster0.qhj8gpn.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
console.log("Connected to MongoDB");

const database = client.db("Heroes");
const infodb = database.collection("info");
const powersdb = database.collection("powers");
const userdb = database.collection("user");

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    server.get("/api/test", (req, res) => {
      return res.send({ list: [] });
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, (err) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
