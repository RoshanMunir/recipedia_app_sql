const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

// ✅ Create a connection pool (better than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,   // 🔥 Max connections (adjust as per server)
  queueLimit: 0          // 🔥 No limit for queued requests
});

// ✅ Use promise wrapper for async/await support
const db = pool.promise();

// ✅ Test connection
(async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("✅ Connected to MySQL database");
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
})();

module.exports = db;
