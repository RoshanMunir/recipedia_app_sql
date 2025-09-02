const express = require("express");
const router = express.Router();
const Ingredient = require("../models/Ingredient");
const authenticate = require("../middleware/authenticate");

// ✅ Get all ingredients
router.get("/", authenticate, async (req, res) => {
  const ingredients = await Ingredient.getAll();
  res.json(ingredients);
});

// ✅ Get ingredient by ID
router.get("/:id", authenticate, async (req, res) => {
  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
  res.json(ingredient);
});

// ✅ Add new ingredient
router.post("/", authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Ingredient name is required" });

  const result = await Ingredient.create({ name });
  res.status(201).json({ message: "Ingredient added", ingredientId: result.insertId });
});

// ✅ Update ingredient
router.put("/:id", authenticate, async (req, res) => {
  const success = await Ingredient.update(req.params.id, req.body.name);
  if (!success) return res.status(404).json({ message: "Ingredient not found" });
  res.json({ message: "Ingredient updated" });
});

// ✅ Delete ingredient
router.delete("/:id", authenticate, async (req, res) => {
  const success = await Ingredient.delete(req.params.id);
  if (!success) return res.status(404).json({ message: "Ingredient not found" });
  res.json({ message: "Ingredient deleted" });
});

module.exports = router;
