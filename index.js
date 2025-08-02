require("dotenv").config();
const express = require("express");
const { sql, poolPromise } = require("./db");

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 FAI Webhook Server</h1>
    <p>Server đang chạy tại port ${process.env.PORT || 3000}</p>
    <p>Webhook endpoint: <code>/webhook</code></p>
    <p>Status: ✅ Active</p>
  `);
});
app.post("/webhook", async (req, res) => {
  try {
    console.log("📥 Received request:", req.body);

    const token = req.body.token;
    if (token !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({
        messages: [{ text: "Token không hợp lệ." }],
      });
    }

    const { sender_id } = req.body;
    if (!sender_id) {
      return res.json({
        messages: [{ text: "Thiếu thông tin sender_id." }],
      });
    }

    const pool = await poolPromise;

    // Ví dụ query
    const result = await pool
      .request()
      .input("EmployeeID", sql.VarChar, sender_id).query(`
        SELECT TOP 1 FullName, Department
        FROM Employee
        WHERE EmployeeID = @EmployeeID
      `);

    if (result.recordset.length === 0) {
      return res.json({
        messages: [{ text: "Không tìm thấy nhân viên." }],
      });
    }

    const emp = result.recordset[0];
    const reply = `Nhân viên: ${emp.FullName}\nPhòng ban: ${emp.Department}`;

    res.json({
      messages: [{ text: reply }],
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.json({
      messages: [{ text: "Đã xảy ra lỗi xử lý dữ liệu." }],
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Webhook chạy tại http://localhost:${port}`);
});
