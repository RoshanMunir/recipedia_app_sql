const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticate = require("../middleware/authenticate");

// Get all ingredients (protected)
router.get("/", authenticate, (req, res) => {
  const query = "SELECT * FROM ingredients";

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

// Get ingredients by recipe ID (protected)
router.get("/recipe/:recipeId", authenticate, (req, res) => {
  const recipeId = req.params.recipeId;
  const query = "SELECT * FROM ingredients WHERE recipe_id = ?";

  db.query(query, [recipeId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
});

// Add a new ingredient (protected)
router.post("/", authenticate, (req, res) => {
  const { name, quantity, recipe_id } = req.body;
  const query = "INSERT INTO ingredients (name, quantity, recipe_id) VALUES (?, ?, ?)";

  db.query(query, [name, quantity, recipe_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Ingredient added", ingredientId: results.insertId });
  });
});

module.exports = router;
