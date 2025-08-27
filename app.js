const express = require("express");
const app = express();
require("dotenv").config();

// Middleware
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const ingredientRoutes = require("./routes/ingredients"); // ✅ your import

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/ingredients", ingredientRoutes); // ✅ attach the route

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
