// models/recipeIngredient.js
"use strict";

const pool = require("../db");

// normalize quantity a bit (optional)
const normQty = (s) => (s ?? "").toString().trim();

const RecipeIngredient = {
  // ➕ Add or update an ingredient in a recipe (idempotent on (recipe_id, ingredient_id))
  async addOrUpdate({ recipe_id, ingredient_id, quantity, unit = null, note = null }) {
    const qps = normQty(quantity); // map to quantity_per_serving
    const [res] = await pool.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity_per_serving, unit, note)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         quantity_per_serving = VALUES(quantity_per_serving),
         unit = VALUES(unit),
         note = VALUES(note)`,
      [recipe_id, ingredient_id, qps || null, unit || null, note || null]
    );
    return { affectedRows: res.affectedRows, insertId: res.insertId };
  },

  // 📖 Ingredients for a recipe (alias to quantity for the app)
  async getByRecipeId(recipe_id) {
    const [rows] = await pool.query(
      `SELECT
         i.id,
         i.name,
         ri.quantity_per_serving AS quantity,
         ri.unit,
         ri.note
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = ?
       ORDER BY i.name ASC`,
      [recipe_id]
    );
    return rows;
  },

  // ✏️ Update a single pair
  async update({ recipe_id, ingredient_id, quantity, unit = null, note = null }) {
    const qps = normQty(quantity);
    const [res] = await pool.query(
      `UPDATE recipe_ingredients
         SET quantity_per_serving = ?, unit = ?, note = ?
       WHERE recipe_id = ? AND ingredient_id = ?`,
      [qps || null, unit || null, note || null, recipe_id, ingredient_id]
    );
    return { updated: res.affectedRows > 0 };
  },

  // ❌ Delete one ingredient from a recipe
  async delete({ recipe_id, ingredient_id }) {
    const [res] = await pool.query(
      "DELETE FROM recipe_ingredients WHERE recipe_id = ? AND ingredient_id = ?",
      [recipe_id, ingredient_id]
    );
    return { deleted: res.affectedRows > 0 };
  },

  // ❌ Delete all ingredients for a recipe
  async deleteByRecipeId(recipe_id) {
    const [res] = await pool.query(
      "DELETE FROM recipe_ingredients WHERE recipe_id = ?",
      [recipe_id]
    );
    return { deletedCount: res.affectedRows };
  },

  // 📖 Recipes that use a given ingredient
  async getRecipesByIngredientId(ingredient_id) {
    const [rows] = await pool.query(
      `SELECT r.*
         FROM recipe_ingredients ri
         JOIN recipes r ON ri.recipe_id = r.id
        WHERE ri.ingredient_id = ?`,
      [ingredient_id]
    );
    return rows;
  },
};

module.exports = RecipeIngredient;
