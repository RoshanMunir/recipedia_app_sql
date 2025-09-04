const express = require("express");
const Dashboard = require("../models/dashboard");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// 🟢 Get liked recipes (only logged-in user)
router.get("/liked", authenticate, async (req, res) => {
  try {
    const liked = await Dashboard.getLikedRecipes(req.user.id);
    res.json(liked);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Get recipes by category
router.get("/category/:category", async (req, res) => {
  try {
    const recipes = await Dashboard.getRecipesByCategory(req.params.category);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟢 Get recommended recipes
router.get("/recommended", async (req, res) => {
  try {
    const recipes = await Dashboard.getRecommendedRecipes();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
