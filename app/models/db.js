// 


const mysql2 = require('mysql2');
const dbConfig = require('../config/dbconfig.js');



const connection = mysql2.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});


connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database1.");
});

module.exports = { connection };
