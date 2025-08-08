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
    console.log("📥 Received request body:", JSON.stringify(req.body, null, 2));

    const token = req.body.token;
    if (token !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({
        messages: [{ text: "Token không hợp lệ." }],
      });
    }

    const pool = await poolPromise;
    const requestDb = pool.request();

    // Gán tham số từ body (bạn sẽ chỉnh lại tên param cho đúng)
    const {
      UserGroupID,
      EmpCode,
      LSEquipmentCode,
      FromHour,
      FromMin,
      ToHour,
      ToMin,
      Description,
      Note,
      LanguageID,
    } = req.body;

    // Lệnh gọi stored procedure
    requestDb
      .input("Activity", sql.VarChar(50), "AddOrUpdate") // hoặc giá trị khác
      .input("UserGroupID", sql.VarChar(50), UserGroupID || "Admin")
      .input("LanguageID", sql.NChar(2), LanguageID || "VN")
      .input("EmpCode", sql.NVarChar(255), EmpCode)
      .input("LSEquipmentCode", sql.NVarChar(255), LSEquipmentCode)
      .input("DateID", sql.NVarChar(255), null) // để trong stored tự dùng GETDATE()
      .input("FromHour", sql.NVarChar(255), FromHour)
      .input("FromMin", sql.NVarChar(255), FromMin)
      .input("ToHour", sql.NVarChar(255), ToHour)
      .input("ToMin", sql.NVarChar(255), ToMin)
      .input("Description", sql.NVarChar(500), Description)
      .input("Note", sql.NVarChar(255), Note)
      .output("ReturnMessCode", sql.NVarChar(1))
      .output("ReturnMess", sql.NVarChar(500));

    // Thực thi
    const result = await requestDb.execute(
      "HR_spfrmRegistrationEquipment_Import"
    );

    // Đọc output
    const code = result.output.ReturnMessCode;
    const message = result.output.ReturnMess;

    console.log("✅ Stored procedure executed:", { code, message });

    res.json({
      messages: [{ text: `Kết quả: ${message} (Code: ${code})` }],
    });
  } catch (err) {
    console.error("❌ Error executing stored procedure:", err);
    res.json({
      messages: [{ text: "Đã xảy ra lỗi xử lý dữ liệu." }],
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Webhook chạy tại http://localhost:${port}`);
});
