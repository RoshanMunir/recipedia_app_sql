const express = require("express");
const Recipe = require("../models/Recipe");
const RecipeIngredient = require("../models/recipeingredient");
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
  try {
    const { name, description, cook_time, baseServings, ingredients, is_private = 1 } = req.body;
    const userId = req.user.id;

    if (!name || !cook_time || !baseServings || !ingredients?.length) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const difficulty = calculateDifficulty(cook_time, ingredients.length);

    const recipeResult = await Recipe.create({
      userId,
      name,
      description,
      cook_time,
      baseServings,
      is_private,
    });

    // ➕ Add ingredients to recipe
    for (const ing of ingredients) {
      await RecipeIngredient.add({
        recipe_id: recipeResult.insertId,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity_per_serving,
      });
    }

    res.status(201).json({
      message: "Recipe added successfully",
      recipeId: recipeResult.insertId,
      difficulty,
      is_private,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding recipe", error: err.message });
  }
});

// 📖 Get all PUBLIC recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.getAllPublic();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recipes", error: err.message });
  }
});

// 📖 Get logged-in user's recipes
router.get("/my", authenticate, async (req, res) => {
  try {
    const recipes = await Recipe.getByUserId(req.user.id);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user recipes", error: err.message });
  }
});

// 📖 Get recipe by ID (respect privacy)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.is_private && recipe.user_id !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to view this recipe" });
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recipe", error: err.message });
  }
});

// ✏️ Update recipe
router.put("/:id", authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ message: "You cannot update this recipe" });
    }

    const success = await Recipe.update(req.params.id, req.body);
    if (!success) return res.status(400).json({ message: "Update failed" });

    res.json({ message: "Recipe updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating recipe", error: err.message });
  }
});

// ❌ Delete recipe
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.user_id !== req.user.id) {
      return res.status(403).json({ message: "You cannot delete this recipe" });
    }

    const success = await Recipe.delete(req.params.id);
    if (!success) return res.status(400).json({ message: "Delete failed" });

    res.json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting recipe", error: err.message });
  }
});

module.exports = router;
