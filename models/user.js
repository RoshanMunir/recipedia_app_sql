const pool = require("../db");

const User = {
  create: async ({ username, email, password, role = "seeker", is_paid = 0 }) => {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role, is_paid, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [username, email, password, role, is_paid]
    );
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  upgradeToProfessional: async (id) => {
    const [result] = await pool.query(
      "UPDATE users SET role = 'professional_chef', is_paid = 1 WHERE id = ?",
      [id]
    );
    return result;
  },

  getPaidUsers: async () => {
    const [rows] = await pool.query("SELECT * FROM users WHERE is_paid = 1");
    return rows;
  },

  updatePassword: async (id, newHashedPassword) => {
    const [result] = await pool.query("UPDATE users SET password = ? WHERE id = ?", [newHashedPassword, id]);
    return result.affectedRows > 0;
  },

  searchByUsername: async (keyword) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE username LIKE ?", [`%${keyword}%`]);
    return rows;
  },
};

module.exports = User;
