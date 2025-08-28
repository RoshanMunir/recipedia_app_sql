const pool = require('../db');

const Recipe = {
  create: async ({ name, baseServings }) => {
    const [result] = await pool.query(
      "INSERT INTO recipes (name, baseServings) VALUES (?, ?)",
      [name, baseServings]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT r.id, r.name, r.baseServings,
              GROUP_CONCAT(i.name SEPARATOR ', ') AS ingredients
       FROM recipes r
       LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       GROUP BY r.id`
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM recipes WHERE id = ?", [id]);
    return rows[0];
  }
};

module.exports = Recipe;
