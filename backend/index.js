const express = require("express");
const port = 3000;

const app = express();

// To be replaced by sequelize
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("../makan_time.db");

app.get("/restaurant", (req, res) => {
  db.all("SELECT * FROM restaurants", (err, rows) => {
    console.log("success" + rows);
    res.status(200).json("success" + rows);
  });
});

app.listen(port, (err) => {
  if (err) {
    console.log(`Cannot Listen on PORT: ${port}`);
  } else {
    console.log(`Server is Listening on: http://localhost:${port}/`);
  }
});
