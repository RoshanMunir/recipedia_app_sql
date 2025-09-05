// models/dashboard.js
const pool = require("../db");

const Dashboard = {
  // User’s liked recipes (uses favorites table)
  async getLikedRecipes(userId) {
    const [rows] = await pool.query(
      `SELECT r.* 
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  // Recipes by category (with optional pagination)
  async getRecipesByCategory(category, limit = 10, offset = 0) {
    const [rows] = await pool.query(
      "SELECT * FROM recipes WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [category, limit, offset]
    );
    return rows;
  },

  // Recommended recipes (latest N or randomized)
  async getRecommendedRecipes(limit = 10) {
    const [rows] = await pool.query(
      "SELECT * FROM recipes ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    return rows;
  },
};

module.exports = Dashboard;
