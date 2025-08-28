const pool = require('../db');

const RecipeIngredient = {
  add: async ({ recipe_id, ingredient_id, quantity }) => {
    const [result] = await pool.query(
      "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)",
      [recipe_id, ingredient_id, quantity]
    );
    return result;
  },

  getByRecipeId: async (recipe_id) => {
    const [rows] = await pool.query(
      `SELECT i.name, ri.quantity
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = ?`,
      [recipe_id]
    );
    return rows;
  }
};

module.exports = RecipeIngredient;
