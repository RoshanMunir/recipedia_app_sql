const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const ingredientRoutes = require("./routes/ingredients");

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/ingredients", ingredientRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
