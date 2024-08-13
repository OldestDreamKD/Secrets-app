require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/userDB");
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
}

connectToDatabase();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async function (req, res) {
  try {
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password),
    });

    await newUser.save();
    res.render("secrets");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = md5(req.body.password);

  try {
    const result = await User.findOne({ email: username });
    if (result) {
      if (result.password == password) {
        res.render("secrets");
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
