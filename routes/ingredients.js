// routes/ingredients.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 📝 Get all ingredients
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ingredients");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Get single ingredient by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM ingredients WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Ingredient not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Add new ingredient
router.post("/", async (req, res) => {
  try {
    const { name, unit } = req.body;
    if (!name || !unit) return res.status(400).json({ message: "Name and unit are required" });

    const [result] = await pool.query(
      "INSERT INTO ingredients (name, unit) VALUES (?, ?)",
      [name, unit]
    );
    res.status(201).json({ id: result.insertId, name, unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update ingredient
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit } = req.body;
    if (!name || !unit) return res.status(400).json({ message: "Name and unit are required" });

    await pool.query("UPDATE ingredients SET name=?, unit=? WHERE id=?", [name, unit, id]);
    res.json({ message: "Ingredient updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Delete ingredient
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deletion if ingredient is used in recipes
    const [used] = await pool.query("SELECT * FROM recipe_ingredients WHERE ingredient_id=?", [id]);
    if (used.length > 0) return res.status(400).json({ message: "Ingredient is used in recipes" });

    await pool.query("DELETE FROM ingredients WHERE id=?", [id]);
    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
