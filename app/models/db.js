// 


const mysql2 = require('mysql2');
const dbConfig = require('../config/dbconfig.js');

// // Create a connection pool
// const pool = mysql2.createPool({
//   host: dbConfig.HOST,
//   user: dbConfig.USER,
//   password: dbConfig.PASSWORD,
//   database: dbConfig.DB
// });

// // Now get a Promise wrapped instance of that pool
// pool.getConnection((err, connection) => {
//   if (err) {
//       console.error('Error connecting to database:', err);
//       return;
//   }
//   console.log('Connected to the database!');
//   connection.release(); // Release the connection
// });

// // Export the pool for use in your application
// module.exports = pool;

const connection = mysql2.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  keepAliveInitialDelay: 10000, // 0 by default.
  enableKeepAlive: true, // false by default.
});

//For temporary exporter
// const connection2 = mysql.createConnection({
//   host: dbConfig.HOST,
//   user: dbConfig.USER,
//   password: dbConfig.PASSWORD,
//   database: dbConfig.DB //"cp"
// });
// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database1.");
});
// open the MySQL connection2
// connection2.connect(error => {
//   if (error) throw error;
//   console.log("Successfully connected to the database2.");
// });

module.exports = { connection };