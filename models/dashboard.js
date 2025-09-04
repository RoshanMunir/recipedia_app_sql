const pool = require("../db");

const Dashboard = {
  // ✅ User liked recipes
  getLikedRecipes: async (userId) => {
    const [rows] = await pool.query(
      `SELECT r.* 
       FROM user_history uh
       JOIN recipes r ON uh.recipe_id = r.id
       WHERE uh.user_id = ? AND uh.liked = 1`,
      [userId]
    );
    return rows;
  },

  // ✅ Recipes by category
  getRecipesByCategory: async (category) => {
    const [rows] = await pool.query(
      "SELECT * FROM recipes WHERE category = ? ORDER BY created_at DESC LIMIT 10",
      [category]
    );
    return rows;
  },

  // ✅ Recommended recipes (latest 10)
  getRecommendedRecipes: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM recipes ORDER BY RAND() LIMIT 10"
    );
    return rows;
  },
};

module.exports = Dashboard;
