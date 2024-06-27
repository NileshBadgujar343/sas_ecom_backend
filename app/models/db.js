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
const promisePool = pool.promise();

// Test the connection
promisePool.getConnection()
  .then(connection => {
    console.log('Connected to the database as id ' + connection.threadId);
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.stack);
  });

module.exports = { promisePool };
