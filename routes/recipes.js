const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/authenticate");

// Get all recipes (protected)
router.get("/", authenticate, (req, res) => {
  const query = "SELECT * FROM recipes";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

// Get a single recipe by ID (protected)
router.get("/:id", authenticate, (req, res) => {
  const recipeId = req.params.id;
  const query = "SELECT * FROM recipes WHERE id = ?";

  db.query(query, [recipeId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) return res.status(404).json({ message: "Recipe not found" });

    res.json(results[0]);
  });
});

// Add a new recipe (protected)
router.post("/", authenticate, (req, res) => {
  const { name, description } = req.body;
  const query = "INSERT INTO recipes (name, description) VALUES (?, ?)";

  db.query(query, [name, description], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Recipe created", recipeId: results.insertId });
  });
});

module.exports = router;
