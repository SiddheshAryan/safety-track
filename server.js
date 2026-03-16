const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");
const pool = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        roll VARCHAR(50) UNIQUE NOT NULL,
        gender VARCHAR(20),
        faculty VARCHAR(100),
        mother VARCHAR(100),
        father VARCHAR(100),
        parent_mobile VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS parents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        child_roll VARCHAR(50) NOT NULL,
        mobile VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        subject VARCHAR(100),
        mobile VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        roll VARCHAR(50) NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        status VARCHAR(20) DEFAULT 'tracking',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database tables ready");
  } catch (error) {
    console.error("Database init error:", error.message);
  }
}

initDb();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------------- STUDENT ---------------- */

app.post("/register/student", async (req, res) => {
  try {
    const { name, roll, gender, faculty, mother, father, parent_mobile } = req.body;

    if (!name || !roll) {
      return res.status(400).json({
        success: false,
        message: "Name and roll are required"
      });
    }

    await pool.query(
      `INSERT INTO students (name, roll, gender, faculty, mother, father, parent_mobile)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (roll) DO UPDATE SET
         name = EXCLUDED.name,
         gender = EXCLUDED.gender,
         faculty = EXCLUDED.faculty,
         mother = EXCLUDED.mother,
         father = EXCLUDED.father,
         parent_mobile = EXCLUDED.parent_mobile`,
      [name, roll, gender, faculty, mother, father, parent_mobile]
    );

    res.json({
      success: true,
      message: "Student registered successfully"
    });
  } catch (error) {
    console.error("Student registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "Student registration failed"
    });
  }
});

app.get("/student/:roll", async (req, res) => {
  try {
    const { roll } = req.params;

    const result = await pool.query(
      `SELECT * FROM students WHERE roll = $1 LIMIT 1`,
      [roll]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Student fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch student"
    });
  }
});

/* ---------------- PARENT ---------------- */

app.post("/register/parent", async (req, res) => {
  try {
    const { name, child_roll, mobile } = req.body;

    if (!name || !child_roll) {
      return res.status(400).json({
        success: false,
        message: "Parent name and child roll are required"
      });
    }

    const studentCheck = await pool.query(
      `SELECT id FROM students WHERE roll = $1 LIMIT 1`,
      [child_roll]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student roll number not found"
      });
    }

    await pool.query(
      `INSERT INTO parents (name, child_roll, mobile)
       VALUES ($1, $2, $3)`,
      [name, child_roll, mobile]
    );

    res.json({
      success: true,
      message: "Parent registered successfully"
    });
  } catch (error) {
    console.error("Parent registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "Parent registration failed"
    });
  }
});

app.get("/parent/:child_roll", async (req, res) => {
  try {
    const { child_roll } = req.params;

    const result = await pool.query(
      `SELECT * FROM parents WHERE child_roll = $1 ORDER BY created_at DESC LIMIT 1`,
      [child_roll]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Parent fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch parent"
    });
  }
});

/* ---------------- FACULTY ---------------- */

app.post("/register/faculty", async (req, res) => {
  try {
    const { name, subject, mobile } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Faculty name is required"
      });
    }

    await pool.query(
      `INSERT INTO faculty (name, subject, mobile)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET
         subject = EXCLUDED.subject,
         mobile = EXCLUDED.mobile`,
      [name, subject, mobile]
    );

    res.json({
      success: true,
      message: "Faculty registered successfully"
    });
  } catch (error) {
    console.error("Faculty registration error:", error.message);
    res.status(500).json({
      success: false,
      message: "Faculty registration failed"
    });
  }
});

app.get("/faculty/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const result = await pool.query(
      `SELECT * FROM faculty WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Faculty fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch faculty"
    });
  }
});

/* ---------------- LOCATION ---------------- */

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
      return res.status(404).json({
        success: false,
        message: "No location found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Latest location fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch location"
    });
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

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error("Location history fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not fetch history"
    });
  }
});

/* ---------------- SOCKET ---------------- */

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinParentRoom", (roll) => {
    socket.join(`roll_${roll}`);
  });

  socket.on("locationUpdate", async (data) => {
    try {
      const { roll, lat, lng, status } = data;

      if (!roll || lat === undefined || lng === undefined) return;

      await pool.query(
        `INSERT INTO locations (roll, latitude, longitude, status)
         VALUES ($1, $2, $3, $4)`,
        [roll, lat, lng, status || "tracking"]
      );

      io.to(`roll_${roll}`).emit("locationReceive", {
        roll,
        lat,
        lng,
        status: status || "tracking"
      });
    } catch (error) {
      console.error("locationUpdate error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
