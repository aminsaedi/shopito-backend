const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");

const { Branch } = require("../modules/branchSchema");
const { Chash } = require("../modules/chashSchema");

const router = express.Router();

router.get("/", async (req, res) => {
  const chash = await Chash.find();
  res.status(200).send(chash);
});

router.post("/register", async (req, res) => {
  let chash = await Chash.findOne({ username: req.body.username });
  if (chash) return res.status(400).send("username aleardy exists.");
  const branch = await Branch.findById(req.body.branchId);
  if (!branch) return res.status(400).send("no branch.");
  chash = new Chash({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    branch: {
      _id: branch._id,
      name: branch.name,
      barcodeAddress: branch.barcodeAddress,
    },
  });
  const salt = await bcrypt.genSalt();
  chash.password = await bcrypt.hash(chash.password, salt);
  chash = await chash.save();
  const token = chash.generateAuthToken();
  res
    .status(201)
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(token);
});

router.post("/login", async (req, res) => {
  let chash = await Chash.findOne({ username: req.body.username });
  if (!chash) return res.status(400).send("Username or password is incorrect.");
  const validPassword = await bcrypt.compare(req.body.password, chash.password);
  if (!validPassword)
    return res.status(400).send("Username or password is incorrect.");
  const token = chash.generateAuthToken();
  res
    .status(200)
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(token);
});

module.exports = router;
