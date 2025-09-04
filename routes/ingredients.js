const express = require("express");
const router = express.Router();
const Ingredient = require("../models/Ingredient");
const authenticate = require("../middleware/authenticate");

// 📖 Get all ingredients
router.get("/", authenticate, async (req, res) => {
  try {
    const ingredients = await Ingredient.getAll();
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ingredients", error: err.message });
  }
});

// 📖 Get ingredient by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ingredient", error: err.message });
  }
});

// ➕ Add new ingredient
router.post("/", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Ingredient name is required" });

    const result = await Ingredient.create({ name });
    res.status(201).json({ message: "Ingredient added", ingredientId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Error adding ingredient", error: err.message });
  }
});

// ✏️ Update ingredient
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Ingredient name is required" });

    const success = await Ingredient.update(req.params.id, name);
    if (!success) return res.status(404).json({ message: "Ingredient not found" });

    res.json({ message: "Ingredient updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating ingredient", error: err.message });
  }
});

// ❌ Delete ingredient
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const success = await Ingredient.delete(req.params.id);
    if (!success) return res.status(404).json({ message: "Ingredient not found" });

    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting ingredient", error: err.message });
  }
});

module.exports = router;
