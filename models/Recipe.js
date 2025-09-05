// models/recipe.js  (recommend lowercase filename on *nix)
const pool = require("../db");

const ALLOWED_UPDATE_FIELDS = new Set([
  "name", "description", "cook_time", "base_servings", "is_private", "difficulty", "image_url"
]);

function fieldsToSetClause(fields) {
  const keys = Object.keys(fields).filter(k => ALLOWED_UPDATE_FIELDS.has(k));
  if (!keys.length) return { clause: "", values: [] };
  const clause = keys.map(k => `${k} = ?`).join(", ");
  const values = keys.map(k => fields[k]);
  return { clause, values };
}

const Recipe = {
  // ➕ Create recipe (default public unless caller opts out)
  async create({ userId, name, description, cook_time, baseServings, is_private = 0, difficulty = null, image_url = null }) {
    const [result] = await pool.query(
      `INSERT INTO recipes (user_id, name, description, cook_time, base_servings, is_private, difficulty, image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, name, description || null, cook_time || 0, baseServings || 1, is_private ? 1 : 0, difficulty, image_url]
    );
    return { insertId: result.insertId };
  },

  // 📖 Public recipes with pagination & JSON ingredients
  async getAllPublic({ limit = 12, offset = 0, order = "new" } = {}) {
    limit = Math.max(1, Math.min(50, Number(limit)));
    offset = Math.max(0, Number(offset));
    const orderBy =
      order === "time" ? "ORDER BY (cook_time) ASC" :
      order === "old"  ? "ORDER BY r.created_at ASC" :
                         "ORDER BY r.created_at DESC";

    const [rows] = await pool.query(
      `
      SELECT
        r.id, r.name, r.description, r.cook_time, r.base_servings, r.user_id, r.is_private, r.difficulty, r.image_url, r.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'name', i.name,
            'quantity', ri.quantity,
            'unit', ri.unit,
            'note', ri.note
          )
        ) AS ingredients
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      LEFT JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE r.is_private = 0
      GROUP BY r.id
      ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [limit, offset]
    );
    return rows;
  },

  // 📖 Recipes for a user (optionally include private)
  async getByUserId(userId, { includePrivate = true, limit = 12, offset = 0 } = {}) {
    limit = Math.max(1, Math.min(50, Number(limit)));
    offset = Math.max(0, Number(offset));
    const visClause = includePrivate ? "" : "AND r.is_private = 0";

    const [rows] = await pool.query(
      `
      SELECT
        r.id, r.name, r.description, r.cook_time, r.base_servings, r.is_private, r.difficulty, r.image_url, r.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT('id', i.id, 'name', i.name, 'quantity', ri.quantity, 'unit', ri.unit, 'note', ri.note)
        ) AS ingredients
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      LEFT JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE r.user_id = ? ${visClause}
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [userId, limit, offset]
    );
    return rows;
  },

  // 📖 Single recipe (with ingredients)
  async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT
        r.id, r.name, r.description, r.cook_time, r.base_servings, r.user_id, r.is_private, r.difficulty, r.image_url, r.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT('id', i.id, 'name', i.name, 'quantity', ri.quantity, 'unit', ri.unit, 'note', ri.note)
        ) AS ingredients
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      LEFT JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE r.id = ?
      GROUP BY r.id
      `,
      [id]
    );
    return rows[0] || null;
  },

  // ✏️ Update (whitelisted fields only)
  async update(id, fields) {
    const { clause, values } = fieldsToSetClause(fields || {});
    if (!clause) return { updated: false, reason: "no_fields" };
    const [res] = await pool.query(
      `UPDATE recipes SET ${clause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    return { updated: res.affectedRows > 0 };
  },

  // ❌ Delete (assumes FK ON DELETE CASCADE; otherwise delete children first)
  async delete(id) {
    // Option A (FK cascade exists): just delete
    const [res] = await pool.query("DELETE FROM recipes WHERE id = ?", [id]);
    return { deleted: res.affectedRows > 0 };

    // Option B (no cascade):
    // await pool.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);
    // const [res] = await pool.query("DELETE FROM recipes WHERE id = ?", [id]);
    // return { deleted: res.affectedRows > 0 };
  },

  // 📖 Difficulty filter (only if your schema has `difficulty`)
  async getByDifficulty(difficulty, { limit = 12, offset = 0 } = {}) {
    limit = Math.max(1, Math.min(50, Number(limit)));
    offset = Math.max(0, Number(offset));
    const [rows] = await pool.query(
      `
      SELECT r.id, r.name, r.description, r.cook_time, r.base_servings, r.difficulty, r.created_at
      FROM recipes r
      WHERE r.difficulty = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [difficulty, limit, offset]
    );
    return rows;
  }
};

module.exports = Recipe;
