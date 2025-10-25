const { Sequelize } = require("sequelize");

const db = new Sequelize("", "", "", {
  dialect: "sqlite",
  storage: "./makan_time.db",
});

module.exports = db;
