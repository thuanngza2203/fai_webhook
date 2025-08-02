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

async function testConnection() {
  try {
    console.log("🔄 Đang kết nối SQL Server...");
    const pool = await sql.connect(dbConfig);
    console.log("✅ Kết nối thành công!");
    const result = await pool.request().query("SELECT TOP 1 * FROM sys.tables");
    console.log("✅ Query thành công:", result.recordset);
    await pool.close();
  } catch (err) {
    console.error("❌ Lỗi kết nối:", err);
  }
}

testConnection();
