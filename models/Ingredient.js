const pool = require('../db');

const Ingredient = {
  create: async ({ name }) => {
    const [result] = await pool.query(
      "INSERT INTO ingredients (name) VALUES (?)",
      [name]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM ingredients");
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM ingredients WHERE id = ?", [id]);
    return rows[0];
  }
};

module.exports = Ingredient;
