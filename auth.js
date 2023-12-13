const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateToken } = require("./token");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();

const db = new sqlite3.Database("users.db");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL
  )
`);

router.post("/signup", async (req, res) => {
  try {
    const { Username, Password } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);
    db.run(
      "INSERT INTO users (Username, Password) VALUES (?, ?)",
      [Username, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "User signup successfully" });
      }
    );
  } catch (error) {
    console.error("An error occur while signing up:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { Username, Password } = req.body;

  db.get(
    "SELECT * FROM users WHERE Username = ?",
    [Username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      console.log(user, "user");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }

      const passwordMatch = await bcrypt.compare(Password, user.Password);

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
      const token = generateToken(user);
      res.json({ token });
    }
  );
});

module.exports = { router };
