const mysql = require("mysql");
require("dotenv").config();

let client;

const getClient = () => {
  if (!client) {
    client = mysql.createPool({
      connectionLimit: 10,
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
  }
  return client;
};

const getConnection = () => {
  const client = getClient();
  return new Promise((resolve, reject) => {
    client.getConnection((err, connection) => {
      if (err) {
        reject(err);
      }
      resolve(connection);
    });
  });
};

exports.query = async (query, params = []) => {
  const connection = await getConnection();
  return new Promise((resolve, reject) => {
    connection.query(query, params, (err, results, fields) => {
      connection.release();
      if (err) {
        reject(err);
      }
      resolve(results);
    });
  });
};
