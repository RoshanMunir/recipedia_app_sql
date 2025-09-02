const express = require("express");
const Recipe = require("../models/Recipe");
const RecipeIngredient = require("../models/RecipeIngredient"); // if file name exactly RecipeIngredient.js
// small letters

const authenticate = require("../middleware/authenticate");

const router = express.Router();

// 🟢 Helper to calculate difficulty
function calculateDifficulty(cookTime, ingredientCount) {
  if (cookTime <= 20 && ingredientCount <= 3) return "Easy";
  if ((cookTime > 20 && cookTime <= 45) || ingredientCount <= 6) return "Medium";
  return "Hard";
}

// ➕ Add recipe
router.post("/add", authenticate, async (req, res) => {
  const { name, description, cook_time, baseServings, ingredients } = req.body;
  const userId = req.user.id;

  if (!name || !cook_time || !baseServings || !ingredients?.length)
    return res.status(400).json({ message: "Please provide all fields" });

  const difficulty = calculateDifficulty(cook_time, ingredients.length);
  const recipeResult = await Recipe.create({ userId, name, description, cook_time, baseServings });

  // Add ingredients
  for (const ing of ingredients) {
    await RecipeIngredient.add({ recipe_id: recipeResult.insertId, ingredient_id: ing.ingredient_id, quantity: ing.quantity_per_serving });
  }

  res.status(201).json({ message: "Recipe added successfully", recipeId: recipeResult.insertId, difficulty });
});

// 📖 Get all recipes
router.get("/", async (req, res) => {
  const recipes = await Recipe.getAll();
  res.json(recipes);
});

// 📖 Get user's own recipes
router.get("/my", authenticate, async (req, res) => {
  const recipes = await Recipe.getByUserId(req.user.id);
  res.json(recipes);
});

module.exports = router;
