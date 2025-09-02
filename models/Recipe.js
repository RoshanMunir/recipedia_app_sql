const pool = require("../db");

const Recipe = {
  create: async ({ userId, name, description, cook_time, baseServings }) => {
    const [result] = await pool.query(
      "INSERT INTO recipes (user_id, name, description, cook_time, base_servings, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [userId, name, description, cook_time, baseServings]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.description, r.cook_time, r.base_servings, r.user_id,
              GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredients
       FROM recipes r
       LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       GROUP BY r.id`
    );
    return rows;
  },

  getByUserId: async (userId) => {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE user_id = ?", [userId]);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ?", [id]);
    return rows[0];
  },

  update: async (id, fields) => {
    const setClause = Object.keys(fields).map(key => `${key} = ?`).join(", ");
    const values = Object.values(fields);
    values.push(id);
    const [result] = await pool.query(`UPDATE recipes SET ${setClause} WHERE id = ?`, values);
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM recipes WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  getByDifficulty: async (difficulty) => {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE difficulty = ?", [difficulty]);
    return rows;
  },
};

module.exports = Recipe;
