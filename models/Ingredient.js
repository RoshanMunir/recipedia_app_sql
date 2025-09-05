// models/Ingredients.js
"use strict";

const pool = require("../db");

// normalize: trim + collapse inner whitespace
const normalize = (s) => (s ?? "").trim().replace(/\s+/g, " ");
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n)));

const Ingredients = {
  // ➕ Create (idempotent): returns { id, created }
  async create({ name }) {
    const n = normalize(name);
    if (!n) throw new Error("Ingredient name required");

    const [result] = await pool.query(
      `INSERT INTO ingredients (name) VALUES (?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [n]
    );
    // affectedRows === 1 → inserted; === 2 → duplicate path
    return { id: result.insertId, created: result.affectedRows === 1 };
  },

  // 📖 Paginated list
  async getAll({ limit = 50, offset = 0 } = {}) {
    const lim = clamp(limit, 1, 200);
    const off = Math.max(0, Number(offset));
    const [rows] = await pool.query(
      "SELECT id, name FROM ingredients ORDER BY name ASC LIMIT ? OFFSET ?",
      [lim, off]
    );
    return rows;
  },

  // 📖 Find by id
  async findById(id) {
    const [rows] = await pool.query(
      "SELECT id, name FROM ingredients WHERE id = ?",
      [Number(id)]
    );
    return rows[0] || null;
  },

  // ✏️ Update with duplicate handling
  async update(id, name) {
    const n = normalize(name);
    if (!n) throw new Error("Ingredient name required");

    try {
      const [res] = await pool.query(
        "UPDATE ingredients SET name = ? WHERE id = ?",
        [n, Number(id)]
      );
      if (res.affectedRows === 0) {
        const current = await this.findById(id);
        if (!current) return { updated: false, reason: "not_found" };
        if (current.name === n) return { updated: false, reason: "no_change" };
      }
      return { updated: true };
    } catch (e) {
      if (e && (e.code === "ER_DUP_ENTRY" || e.errno === 1062)) {
        return { updated: false, reason: "duplicate" };
      }
      throw e;
    }
  },

  // ❌ Delete with clear return shape
  async delete(id) {
    try {
      const [res] = await pool.query("DELETE FROM ingredients WHERE id = ?", [Number(id)]);
      if (res.affectedRows === 0) return { deleted: false, reason: "not_found" };
      return { deleted: true };
    } catch (e) {
      // FK violation if used by recipes
      if (e && (e.code === "ER_ROW_IS_REFERENCED_2" || e.errno === 1451)) {
        return { deleted: false, reason: "in_use" };
      }
      throw e;
    }
  },

  // 🔍 Typeahead (prefix search)
  async searchByName(keyword, limit = 20) {
    const q = normalize(keyword);
    const lim = clamp(limit, 1, 50);
    const [rows] = await pool.query(
      "SELECT id, name FROM ingredients WHERE name LIKE CONCAT(?, '%') ORDER BY name ASC LIMIT ?",
      [q, lim]
    );
    return rows;
  },

  // 📖 Ingredients for a recipe (match your DB: quantity_per_serving → quantity)
  async getByRecipeId(recipeId) {
    const [rows] = await pool.query(
      `SELECT i.id, i.name,
              ri.quantity_per_serving AS quantity,
              ri.unit, ri.note
         FROM recipe_ingredients ri
         JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = ?
        ORDER BY i.name ASC`,
      [Number(recipeId)]
    );
    return rows;
  },
};

module.exports = Ingredients;
