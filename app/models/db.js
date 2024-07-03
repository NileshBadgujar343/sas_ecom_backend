// 


const mysql = require('mysql2');
const dbConfig = require('../config/dbconfig.js');



// const connection = mysql2.createConnection({
//   host: dbConfig.HOST,
//   user: dbConfig.USER,
//   password: dbConfig.PASSWORD,
//   database: dbConfig.DB,
//   // keepAliveInitialDelay: 10000, 
//   // enableKeepAlive: true, 
//   connectionLimit: 10,
//   waitForConnections: true,
//   queueLimit: 0
// });
function connection(){
  try{
  const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
    
  });
  const promisePool = pool.promise();

  return promisePool;
}catch (error) {
  return console.log(`Could not connect - ${error}`);
}
  
}


// connection.connect(error => {
//   if (error) throw error;
//   console.log("Successfully connected to the database1.");
// });
const pool = connection();

module.exports = {
  connection: async () => pool.getConnection(),
  execute: (...params) => pool.execute(...params)
};

// module.exports = { connection };
