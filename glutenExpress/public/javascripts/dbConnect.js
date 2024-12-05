const dotenv = require('dotenv');
const mysql2 = require('mysql2/promise');

dotenv.config();

var pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 100,
  queueLimit: 0,
  connectTimeout: 10000, 
  waitForConnections: true,
});

pool.getConnection((err, connection) => {
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
  connection.release();
});

module.exports = pool;
