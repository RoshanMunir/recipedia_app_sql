const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// Database connection
const db = require("./db");

// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const ingredientRoutes = require("./routes/ingredients");
const dashboardRoutes = require("./routes/dashboard");

// Connect routes
app.use("/auth", authRoutes);            // Signup/Login
app.use("/recipes", recipeRoutes);       // Recipes CRUD
app.use("/ingredients", ingredientRoutes); // Ingredients CRUD
app.use("/dashboard", dashboardRoutes);  // Dashboard APIs

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🍴 Recipe API is running...");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
