const { Sequelize } = require("sequelize");

const db = new Sequelize("", "", "", {
  dialect: "sqlite",
  storage: "./makan_time.db",
  pool: {
    max: 100,
    min: 0,
    idle: 200000,
    acquire: 1000000,
  },
});

module.exports = db;
