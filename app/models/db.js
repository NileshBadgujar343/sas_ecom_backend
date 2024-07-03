const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbconfig.js');

// Create a connection pool
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: 10,  // Adjust as needed
  queueLimit: 0
});

// Export the pool for use in your application
module.exports = pool;
