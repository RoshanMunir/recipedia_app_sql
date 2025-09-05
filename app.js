const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

// middleware
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/recipes', require('./routes/recipes'));
app.use('/ingredients', require('./routes/ingredients'));
app.use('/dashboard', require('./routes/dashboard'));

// health
app.get('/', (_req, res) => res.send('🍴 Recipe API is running.'));

// start
const PORT = process.env.APP_PORT || process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
