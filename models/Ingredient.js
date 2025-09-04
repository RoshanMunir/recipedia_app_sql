const pool = require("../db");

const Ingredient = {
  // ➕ Add new ingredient
  create: async ({ name }) => {
    const [result] = await pool.query(
      "INSERT INTO ingredients (name) VALUES (?)",
      [name]
    );
    return result;
  },

  // 📖 Get all ingredients (sorted by name)
  getAll: async () => {
    const [rows] = await pool.query(
      "SELECT * FROM ingredients ORDER BY name ASC"
    );
    return rows;
  },

  // 📖 Find ingredient by ID
  findById: async (id) => {
    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  // ✏️ Update ingredient
  update: async (id, name) => {
    const [result] = await pool.query(
      "UPDATE ingredients SET name = ? WHERE id = ?",
      [name, id]
    );
    return result.affectedRows > 0;
  },

  // ❌ Delete ingredient
  delete: async (id) => {
    const [result] = await pool.query(
      "DELETE FROM ingredients WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  // 📖 Get ingredients by recipe ID
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

  // 🔍 Search ingredients by name
  searchByName: async (keyword) => {
    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE name LIKE ?",
      [`%${keyword}%`]
    );
    return rows;
  },
};

module.exports = Ingredient;
