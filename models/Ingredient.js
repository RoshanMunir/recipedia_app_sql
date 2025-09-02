const pool = require("../db");

const Ingredient = {
  create: async ({ name }) => {
    const [result] = await pool.query("INSERT INTO ingredients (name) VALUES (?)", [name]);
    return result;
  },

  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM ingredients ORDER BY name ASC");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM ingredients WHERE id = ?", [id]);
    return rows[0];
  },

  update: async (id, name) => {
    const [result] = await pool.query("UPDATE ingredients SET name = ? WHERE id = ?", [name, id]);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM ingredients WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  getByRecipeId: async (recipeId) => {
    const [rows] = await pool.query(
      `SELECT i.* 
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = ?`,
      [recipeId]
    );
    return rows;
  },

  searchByName: async (keyword) => {
    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE name LIKE ?",
      [`%${keyword}%`]
    );
    return rows;
  },
};

module.exports = Ingredient;
