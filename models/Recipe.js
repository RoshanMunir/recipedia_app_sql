const pool = require("../db");

const Recipe = {
  // ➕ Create recipe
  create: async ({ userId, name, description, cook_time, baseServings, is_private = 1 }) => {
    const [result] = await pool.query(
      "INSERT INTO recipes (user_id, name, description, cook_time, base_servings, is_private, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [userId, name, description, cook_time, baseServings, is_private]
    );
    return result;
  },

  // 📖 Get all PUBLIC recipes only
  getAllPublic: async () => {
    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.description, r.cook_time, r.base_servings, r.user_id, r.is_private,
              GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredients
       FROM recipes r
       LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE r.is_private = 0
       GROUP BY r.id`
    );
    return rows;
  },

  // 📖 Get recipes by specific user (unke private + public dono)
  getByUserId: async (userId) => {
    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.description, r.cook_time, r.base_servings, r.is_private,
              GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredients
       FROM recipes r
       LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE r.user_id = ?
       GROUP BY r.id`,
      [userId]
    );
    return rows;
  },

  // 📖 Find recipe by ID
  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ?", [id]);
    return rows[0];
  },

  // ✏️ Update recipe
  update: async (id, fields) => {
    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(", ");
    const values = Object.values(fields);
    values.push(id);
    const [result] = await pool.query(`UPDATE recipes SET ${setClause} WHERE id = ?`, values);
    return result.affectedRows > 0;
  },

  // ❌ Delete recipe
  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM recipes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // 📖 Get recipes by difficulty
  getByDifficulty: async (difficulty) => {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE difficulty = ?", [difficulty]);
    return rows;
  },
};

module.exports = Recipe;
