// 


const mysql2 = require('mysql2');
const dbConfig = require('../config/dbconfig.js');

// Create a connection pool
const pool = mysql2.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// Now get a Promise wrapped instance of that pool
pool.getConnection((err, connection) => {
  if (err) {
      console.error('Error connecting to database:', err);
      return;
  }
  console.log('Connected to the database!');
  connection.release(); // Release the connection
});

// Export the pool for use in your application
module.exports = pool;