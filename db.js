require("dotenv").config();
const sql = require("mssql");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Đã kết nối SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("Lỗi kết nối SQL Server:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
