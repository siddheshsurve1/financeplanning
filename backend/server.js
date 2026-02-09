const express = require("express");
const cors = require("cors");
// const bcrypt = require('bcrypt');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
const { query } = require("./db");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

/* =======================
   HEALTH CHECK
======================= */
app.get("/api/health/db", async (req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "✅ Neon DB OK" });
  } catch (err) {
    res.status(500).json({
      status: "❌ Neon DB DOWN",
      error: err.message,
    });
  }
});

/* =======================
   SIGN UP API ✅
======================= */
app.post("/api/signup", async (req, res) => {
  console.log("STEP 0");

  try {
    const { name, email, password } = req.body;
    console.log("STEP 1", name, email);

    const userExists = await query(
      "SELECT id FROM users_login WHERE email = $1",
      [email]
    );
    console.log("STEP 2");

    // 👉 CHECK HERE
    if (userExists.rows.length > 0) {
      console.log("STEP -2");
      return res.status(409).json({
        success: false,
        message: "Data already present",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("STEP 3");

    await query(
      "INSERT INTO users_login (name, email, password,raw_password) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, password]
    );
    console.log("STEP 4");

    res.json({ success: true });
  } catch (err) {
    console.error("SIGNUP ERROR 👉", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =======================
   LOGIN API ✅
======================= */
app.post('/api/loginin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, name,email, password FROM users_login WHERE email = $1',
      [email]
    );
console.log(result); // full object
    // ❌ Email not found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email not registered'
      });
    }

    const user = result.rows[0];

    // ❌ Wrong password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Wrong password'
      });
    }

    // ✅ Correct login
    return res.status(200).json({
      success: true,
      name: user.name,
      id: user.id,
      email: user.email
    });

  } catch (err) {
    console.error('LOGIN ERROR 👉', err);
    return res.status(500).json({ message: 'DB error' });
  }
});


/* =======================
   FORGOT PASSWORD API ✅
======================= */
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

app.post("/api/forgotpassword", async (req, res) => {
  console.log("STEP 0");

  try {
    const { email } = req.body;

    const newPassword = crypto.randomBytes(4).toString("hex"); // eg: a3f9c2d1
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("STEP 1", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const userExists = await query(
      "SELECT id, name FROM users_login WHERE email = $1",
      [email]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: "Email not registered" });
    }

    /* ==========================
       Generate new password
    ========================== */

    await query(
      "UPDATE users_login SET password = $1,raw_password=$3 WHERE email = $2",
      [hashedPassword, email, newPassword]
    );
    console.log("STEP 2", newPassword);
    /* ==========================
       SMTP configuration
    ========================== */
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    /* ==========================
       Send email
    ========================== */
    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your New Password",
      html: `
        <p>Hello ${userExists.rows[0].name},</p>
        <p>Your password has been reset.</p>
        <p><strong>New Password:</strong> ${newPassword}</p>
        <p>Please login and change your password immediately.</p>
        <br/>
        <p>Finance Tracker Team</p>
      `,
    });

    console.log("STEP 3 Email sent");

    res.json({
      success: true,
      message: "New password sent to email",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR 👉", err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});



/* =======================
   expense API ✅
======================= */
app.post("/api/addexpense", async (req, res) => {
  console.log("STEP 0");

  try {
    const { user_id, name, category, amount, date } = req.body;

    console.log("STEP 1", user_id, name, amount);

    if (!user_id || !name || !category || !amount || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await query(
      `INSERT INTO expenses (user_id, name, category, amount, date)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, name, category, amount, date]
    );

    console.log("STEP 2: Expense inserted");

    res.json({ success: true, message: "Expense added successfully" });

  } catch (err) {
    console.error("check 👉", err);
    res.status(500).json({ message: "DB error" });
  }
});



/* =======================
   investment API ✅
======================= */
app.post("/api/addinvestment", async (req, res) => {
  console.log("STEP 0");

  try {
    const { user_id, name, category, amount, date } = req.body;

    console.log("STEP 1", user_id, name, amount);

    if (!user_id || !name || !category || !amount || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await query(
      `INSERT INTO investments (user_id, name, category, amount, date)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, name, category, amount, date]
    );

    console.log("STEP 2: Investment inserted");

    res.json({ success: true, message: "Investment added successfully" });

  } catch (err) {
    console.error("check 👉", err);
    res.status(500).json({ message: "DB error" });
  }
});


app.get('/api/expenses/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await query(
      'SELECT * FROM expenses WHERE user_id = $1 and delete_status=1  ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

app.get('/api/investments/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await query(
      'SELECT * FROM investments WHERE user_id = $1 and delete_status=1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'DB error' });
  }
});

/* =======================
   delete investment API ✅
======================= */
app.post("/api/deleteinvestment", async (req, res) => {
  console.log("STEP 0");

  try {
    const { id } = req.body;

    console.log("STEP 1", id);

    if (!id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await query(
      `UPDATE investments set delete_status='2' where id=$1`,
      [id]
    );

    console.log("STEP 2: Investment deleted");

    res.json({ success: true, message: "Investment Deleted successfully" });

  } catch (err) {
    console.error("check 👉", err);
    res.status(500).json({ message: "DB error" });
  }
});


/* =======================
   delete expenses API ✅
======================= */
app.post("/api/deleteexpenses", async (req, res) => {
  console.log("STEP 0");

  try {
    const { id } = req.body;

    console.log("STEP 1", id);

    if (!id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await query(
      `UPDATE expenses set delete_status='2' where id=$1`,
      [id]
    );

    console.log("STEP 2: Investment deleted");

    res.json({ success: true, message: "Expenses Deleted successfully" });

  } catch (err) {
    console.error("check 👉", err);
    res.status(500).json({ message: "DB error" });
  }
});