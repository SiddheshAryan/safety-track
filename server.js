const express = require("express");
const http = require("http");
const path = require("path");
const { Pool } = require("pg");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS faculty(
      faculty_id TEXT PRIMARY KEY,
      name TEXT,
      department TEXT,
      mobile TEXT,
      password TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS students(
      roll_number TEXT PRIMARY KEY,
      name TEXT,
      gender TEXT,
      department TEXT,
      faculty_id TEXT,
      mother_name TEXT,
      father_name TEXT,
      parent_mobile TEXT,
      password TEXT,
      FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS parents(
      id SERIAL PRIMARY KEY,
      name TEXT,
      mobile TEXT,
      student_roll TEXT,
      password TEXT,
      FOREIGN KEY (student_roll) REFERENCES students(roll_number)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS locations(
      id SERIAL PRIMARY KEY,
      roll TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Database ready");
}

initDB().catch(console.error);

/* ---------------- REGISTER ---------------- */

app.post("/register-student", async (req, res) => {
  try {
    const {
      name,
      roll_number,
      gender,
      department,
      faculty_id,
      mother_name,
      father_name,
      parent_mobile,
      password
    } = req.body;

    await pool.query(
      `INSERT INTO students
      (roll_number, name, gender, department, faculty_id, mother_name, father_name, parent_mobile, password)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        roll_number,
        name,
        gender,
        department,
        faculty_id,
        mother_name,
        father_name,
        parent_mobile,
        password
      ]
    );

    res.redirect("/login.html?role=student");
  } catch (err) {
    console.error("Student registration error:", err.message);
    res.send("Student registration failed");
  }
});

app.post("/register-parent", async (req, res) => {
  try {
    const { name, mobile, student_roll, password } = req.body;

    await pool.query(
      `INSERT INTO parents(name, mobile, student_roll, password)
       VALUES ($1,$2,$3,$4)`,
      [name, mobile, student_roll, password]
    );

    res.redirect("/login.html?role=parent");
  } catch (err) {
    console.error("Parent registration error:", err.message);
    res.send("Parent registration failed");
  }
});

app.post("/register-faculty", async (req, res) => {
  try {
    const { faculty_id, name, department, mobile, password } = req.body;

    await pool.query(
      `INSERT INTO faculty(faculty_id, name, department, mobile, password)
       VALUES ($1,$2,$3,$4,$5)`,
      [faculty_id, name, department, mobile, password]
    );

    res.redirect("/login.html?role=faculty");
  } catch (err) {
    console.error("Faculty registration error:", err.message);
    res.send("Faculty registration failed");
  }
});

/* ---------------- LOGIN ---------------- */

app.post("/login/student", async (req, res) => {
  try {
    const { roll, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM students WHERE roll_number = $1 AND password = $2`,
      [roll, password]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Invalid student login" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Student login error:", err.message);
    res.json({ success: false, message: "Login failed" });
  }
});

app.post("/login/parent", async (req, res) => {
  try {
    const { student_roll, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM parents WHERE student_roll = $1 AND password = $2`,
      [student_roll, password]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Invalid parent login" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Parent login error:", err.message);
    res.json({ success: false, message: "Login failed" });
  }
});

app.post("/login/faculty", async (req, res) => {
  try {
    const { faculty_id, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM faculty WHERE faculty_id = $1 AND password = $2`,
      [faculty_id, password]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Invalid faculty login" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Faculty login error:", err.message);
    res.json({ success: false, message: "Login failed" });
  }
});

/* ---------------- TRACKING API ---------------- */

app.get("/location/:roll", async (req, res) => {
  try {
    const { roll } = req.params;

    const result = await pool.query(
      `SELECT roll, latitude, longitude, status, created_at
       FROM locations
       WHERE roll = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [roll]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "No location found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Latest location error:", err.message);
    res.json({ success: false, message: "Could not fetch location" });
  }
});

app.get("/location-history/:roll", async (req, res) => {
  try {
    const { roll } = req.params;

    const result = await pool.query(
      `SELECT latitude, longitude, status, created_at
       FROM locations
       WHERE roll = $1
       ORDER BY created_at ASC`,
      [roll]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Location history error:", err.message);
    res.json({ success: false, message: "Could not fetch history" });
  }
});

/* ---------------- SOCKET.IO ---------------- */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinParentRoom", (roll) => {
    socket.join(`roll_${roll}`);
  });

  socket.on("locationUpdate", async (data) => {
    try {
      const { roll, lat, lng, status } = data;

      if (!roll || lat === undefined || lng === undefined) return;

      await pool.query(
        `INSERT INTO locations(roll, latitude, longitude, status)
         VALUES ($1,$2,$3,$4)`,
        [roll, lat, lng, status || "tracking"]
      );

      io.to(`roll_${roll}`).emit("locationReceive", {
        roll,
        lat,
        lng,
        status: status || "tracking"
      });
    } catch (err) {
      console.error("locationUpdate error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
