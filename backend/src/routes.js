const express = require("express");

module.exports = (router) => {
  router.get("/", (req, res) => {
    res
      .status(200)
      .send("Makan Time APIs are online and functioning properly!");
  });
};
