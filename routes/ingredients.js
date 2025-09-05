// routes/ingredients.js
"use strict";

const express = require("express");
const router = express.Router();

// IMPORTANT: This should point to the table model file above.
// If your file is named exactly "models/Ingredients.js", keep the same casing here.
const Ingredients = require("../models/Ingredient");

const authenticate = require("../middleware/authenticate");

// Public: list / search (typeahead)
router.get("/", async (req, res) => {
  try {
    const { query = "", limit, offset } = req.query;

    if (query && query.trim() !== "") {
      const rows = await Ingredients.searchByName(query, Number(limit) || 20);
      return res.json({ data: rows });
    }

    const rows = await Ingredients.getAll({
      limit: Number(limit) || 50,
      offset: Number(offset) || 0,
    });
    res.json({ data: rows });
  } catch {
    res.status(500).json({ message: "Failed to fetch ingredients" });
  }
});

// Public: read one
router.get("/:id", async (req, res) => {
  try {
    const row = await Ingredients.findById(req.params.id);
    if (!row) return res.status(404).json({ message: "Ingredient not found" });
    res.json(row);
  } catch {
    res.status(500).json({ message: "Failed to fetch ingredient" });
  }
});

// Protected: create (idempotent)
router.post("/", authenticate, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Ingredient name is required" });
    }

    const { id, created } = await Ingredients.create({ name });
    return res.status(created ? 201 : 200).json({ id, created });
  } catch {
    // With idempotent insert, 1062 shouldn't surface, but keep generic fallback
    res.status(500).json({ message: "Failed to add ingredient" });
  }
});

// Protected: update
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Ingredient name is required" });
    }

    const result = await Ingredients.update(req.params.id, name);
    if (!result.updated) {
      if (result.reason === "duplicate") return res.status(409).json({ message: "Ingredient name already exists" });
      if (result.reason === "not_found") return res.status(404).json({ message: "Ingredient not found" });
      if (result.reason === "no_change") return res.status(200).json({ message: "No changes", updated: false });
    }
    res.json({ message: "Ingredient updated", updated: true });
  } catch {
    res.status(500).json({ message: "Failed to update ingredient" });
  }
});

// Protected: delete
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const result = await Ingredients.delete(req.params.id);
    if (!result.deleted) {
      if (result.reason === "not_found") return res.status(404).json({ message: "Ingredient not found" });
      if (result.reason === "in_use") return res.status(409).json({ message: "Ingredient is used by recipes", reason: "in_use" });
    }
    res.json({ message: "Ingredient deleted", deleted: true });
  } catch {
    res.status(500).json({ message: "Failed to delete ingredient" });
  }
});

module.exports = router;
