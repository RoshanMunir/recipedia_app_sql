const express = require("express");
const Dashboard = require("../models/dashboard");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// 🟢 Liked recipes (auth required)
router.get("/liked", authenticate, async (req, res) => {
  try {
    const liked = await Dashboard.getLikedRecipes(req.user.userId); // fixed key
    res.json(liked);
  } catch {
    res.status(500).json({ message: "Failed to fetch liked recipes" });
  }
});

// 🟢 Recipes by category (public)
router.get("/category/:category", async (req, res) => {
  try {
    const recipes = await Dashboard.getRecipesByCategory(req.params.category);
    res.json(recipes);
  } catch {
    res.status(500).json({ message: "Failed to fetch recipes by category" });
  }
});

// 🟢 Recommended recipes (public)
router.get("/recommended", async (_req, res) => {
  try {
    const recipes = await Dashboard.getRecommendedRecipes();
    res.json(recipes);
  } catch {
    res.status(500).json({ message: "Failed to fetch recommended recipes" });
  }
});

module.exports = router;
