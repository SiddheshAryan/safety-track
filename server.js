const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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

}

initDB();





/* =============================
STUDENT REGISTRATION
============================= */

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
(roll_number,name,gender,department,faculty_id,mother_name,father_name,parent_mobile,password)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
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

console.log(err);
res.send("Student registration failed");

}

});





/* =============================
PARENT REGISTRATION
============================= */

app.post("/register-parent", async (req, res) => {

try {

const { name, mobile, student_roll, password } = req.body;

await pool.query(
`INSERT INTO parents(name,mobile,student_roll,password)
VALUES($1,$2,$3,$4)`,
[name, mobile, student_roll, password]
);

res.redirect("/login.html?role=parent");

} catch (err) {

console.log(err);
res.send("Parent registration failed");

}

});





/* =============================
FACULTY REGISTRATION
============================= */

app.post("/register-faculty", async (req, res) => {

try {

const { faculty_id, name, department, mobile, password } = req.body;

await pool.query(
`INSERT INTO faculty(faculty_id,name,department,mobile,password)
VALUES($1,$2,$3,$4,$5)`,
[faculty_id, name, department, mobile, password]
);

res.redirect("/login.html?role=faculty");

} catch (err) {

console.log(err);
res.send("Faculty registration failed");

}

});





/* =============================
LOGIN ROUTES
============================= */

app.post("/login/student", async (req, res) => {

const { roll, password } = req.body;

const result = await pool.query(
`SELECT * FROM students WHERE roll_number=$1 AND password=$2`,
[roll, password]
);

if (result.rows.length === 0)
return res.json({ success: false });

res.json({ success: true });

});



app.post("/login/parent", async (req, res) => {

const { student_roll, password } = req.body;

const result = await pool.query(
`SELECT * FROM parents WHERE student_roll=$1 AND password=$2`,
[student_roll, password]
);

if (result.rows.length === 0)
return res.json({ success: false });

res.json({ success: true });

});



app.post("/login/faculty", async (req, res) => {

const { faculty_id, password } = req.body;

const result = await pool.query(
`SELECT * FROM faculty WHERE faculty_id=$1 AND password=$2`,
[faculty_id, password]
);

if (result.rows.length === 0)
return res.json({ success: false });

res.json({ success: true });

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Server running on port", PORT);
});
