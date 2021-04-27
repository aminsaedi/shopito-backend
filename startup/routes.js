const express = require("express");

const branch = require("../routes/branch");
const chash = require("../routes/chash");
const product = require("../routes/product");
const customer = require("../routes/customer");
const shopping = require("../routes/shopping");
const onlinePayment = require("../routes/onlinePayment");
const motherPassword = require("../routes/checkMothePassword");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/branch", branch);
  app.use("/api/chash", chash);
  app.use("/api/product", product);
  app.use("/api/customer", customer);
  app.use("/api/shopping", shopping);
  app.use("/api/onlinePayment", onlinePayment);
  app.use("/api/motherPassword", motherPassword);
};
