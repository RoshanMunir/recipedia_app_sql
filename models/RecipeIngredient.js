const pool = require("../db");

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
  },

  update: async ({ recipe_id, ingredient_id, quantity }) => {
    const [result] = await pool.query(
      "UPDATE recipe_ingredients SET quantity = ? WHERE recipe_id = ? AND ingredient_id = ?",
      [quantity, recipe_id, ingredient_id]
    );
    return result.affectedRows > 0;
  },

  delete: async ({ recipe_id, ingredient_id }) => {
    const [result] = await pool.query(
      "DELETE FROM recipe_ingredients WHERE recipe_id = ? AND ingredient_id = ?",
      [recipe_id, ingredient_id]
    );
    return result.affectedRows > 0;
  },

  getRecipesByIngredientId: async (ingredient_id) => {
    const [rows] = await pool.query(
      `SELECT r.* 
       FROM recipe_ingredients ri
       JOIN recipes r ON ri.recipe_id = r.id
       WHERE ri.ingredient_id = ?`,
      [ingredient_id]
    );
    return rows;
  },
};

module.exports = RecipeIngredient;
