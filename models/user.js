// models/user.js
"use strict";

const pool = require("../db");

// Public fields to return to the app (no password hash)
const PUBLIC_FIELDS = "id, username, email, role, is_paid, created_at, updated_at";

// Helpers to normalize inputs
const normEmail = (s) => (s || "").trim().toLowerCase();
const normUsername = (s) => (s || "").trim();

const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n)));

const User = {
  /**
   * Create a user (password must already be hashed).
   * @param {object} params
   * @param {string} params.username
   * @param {string} params.email
   * @param {string} params.password_hash
   * @param {string} [params.role='user'] - 'user' | 'admin' | 'professional_chef'
   * @param {number} [params.is_paid=0]  - 0 or 1
   * @returns {{ insertId: number }}
   */
  async create({ username, email, password_hash, role = "user", is_paid = 0 }) {
    const u = normUsername(username);
    const e = normEmail(email);

    const [res] = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, is_paid, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [u, e, password_hash, role, is_paid ? 1 : 0]
    );
    return { insertId: res.insertId };
  },

  /**
   * Find a user by email (includes password_hash for login).
   * @param {string} email
   * @returns {object|null}
   */
  async findByEmail(email) {
    const e = normEmail(email);
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_FIELDS}, password_hash
         FROM users
        WHERE LOWER(email) = ?
        LIMIT 1`,
      [e]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by id (no password hash).
   * @param {number} id
   * @returns {object|null}
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
         FROM users
        WHERE id = ?
        LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Update a user's password_hash.
   * @param {number} id
   * @param {string} newHash
   * @returns {{ updated: boolean }}
   */
  async updatePassword(id, newHash) {
    const [res] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newHash, id]
    );
    return { updated: res.affectedRows > 0 };
  },

  /**
   * Upgrade a user to professional_chef and mark as paid.
   * Typically called after a successful payment.
   * @param {number} id
   * @returns {{ updated: boolean }}
   */
  async upgradeToProfessional(id) {
    const [res] = await pool.query(
      "UPDATE users SET role = 'professional_chef', is_paid = 1 WHERE id = ?",
      [id]
    );
    return { updated: res.affectedRows > 0 };
  },

  /**
   * List paid users (paginated).
   * @param {{ limit?: number, offset?: number }} opts
   * @returns {Array<object>}
   */
  async getPaidUsers({ limit = 50, offset = 0 } = {}) {
    const lim = clamp(limit, 1, 200);
    const off = Math.max(0, Number(offset));
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
         FROM users
        WHERE is_paid = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
      [lim, off]
    );
    return rows;
  },

  /**
   * Search users by username prefix (paginated).
   * @param {string} keyword
   * @param {{ limit?: number, offset?: number }} opts
   * @returns {Array<object>}
   */
  async searchByUsername(keyword, { limit = 20, offset = 0 } = {}) {
    const lim = clamp(limit, 1, 100);
    const off = Math.max(0, Number(offset));
    const q = normUsername(keyword);
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_FIELDS}
         FROM users
        WHERE username LIKE CONCAT(?, '%')
        ORDER BY username ASC
        LIMIT ? OFFSET ?`,
      [q, lim, off]
    );
    return rows;
  },
};

module.exports = User;
