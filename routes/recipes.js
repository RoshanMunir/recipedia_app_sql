const express = require("express");
const router = express.Router();
const pool = require("../db.js");

// 📝 Get all recipes with ingredients
router.get("/", async (req, res) => {
  try {
    const [recipes] = await pool.query("SELECT * FROM recipes");

    for (let recipe of recipes) {
      const [ingredients] = await pool.query(
        `SELECT i.id, i.name, ri.quantity, i.unit
         FROM recipe_ingredients ri
         JOIN ingredients i ON ri.ingredient_id = i.id
         WHERE ri.recipe_id = ?`,
        [recipe.id]
      );
      recipe.ingredients = ingredients;
    }

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Add new recipe
router.post("/", async (req, res) => {
  try {
    const { user_id, name, base_servings, instructions, ingredients } = req.body;

    const [result] = await pool.query(
      "INSERT INTO recipes (user_id, name, base_servings, instructions) VALUES (?, ?, ?, ?)",
      [user_id, name, base_servings, instructions]
    );

    const recipeId = result.insertId;

    if (ingredients && ingredients.length > 0) {
      for (let ing of ingredients) {
        await pool.query(
          "INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)",
          [recipeId, ing.ingredient_id, ing.quantity]
        );
      }
    }

    res.json({ message: "Recipe created", recipeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update recipe
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, base_servings, instructions } = req.body;

    await pool.query(
      "UPDATE recipes SET name=?, base_servings=?, instructions=? WHERE id=?",
      [name, base_servings, instructions, id]
    );

    res.json({ message: "Recipe updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📝 Delete recipe
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM recipe_ingredients WHERE recipe_id=?", [id]);
    await pool.query("DELETE FROM recipes WHERE id=?", [id]);

    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
