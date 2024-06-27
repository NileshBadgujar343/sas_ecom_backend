const mysql2 = require("mysql2");
const dbConfig = require("../config/dbconfig.js")

// Create a connection to the database
// const connection = mysql2.createConnection({
//   host: dbConfig_HOST,
//   user: dbConfig_USER,
//   password: dbConfig_PASSWORD,
//   database: dbConfig_DB
// });
const connection = mysql2.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
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

// open the mysql2 connection2
// connection2.connect(error => {
//   if (error) throw error;
//   console.log("Successfully connected to the database2.");
// });

module.exports = { connection };