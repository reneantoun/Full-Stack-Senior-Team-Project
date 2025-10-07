/***************************************************************************
* Filename: db.js
* Developer: Jackson Hill
* Date: 4/13/2024
* Notes: Start a MySQL connection using a pool
****************************************************************************/
const DB = require("../config/db.config.js");
const mysql = require('mysql');

//Create a pool connection using the information from db.config.js
const connection = mysql.createPool({
  user: DB.USER,
  host: DB.HOST,
  database: DB.DB,
  password: DB.PASSWORD,
  port: DB.PORT,
  waitForConnections: DB.WAITFORCONNECTIONS,
  connectionLimit: DB.CONNECTIONLIMIT,
  queueLimit: DB.QUEUELIMIT,
});

//Start connection
connection.getConnection((err,con)=> {
  if(err)
    throw err;
  console.log('Database connected successfully');
  con.release();
});

module.exports = connection;