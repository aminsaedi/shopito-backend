const express = require("express");
const config = require("config");

const router = express.Router();

router.post("/verify", async (req, res) => {
  if (!req.body.password) return res.status(400).send("give me a password");
  const motherPassword = config.get("motherPassword");
  if (!motherPassword) return res.status(500).send("Internal server error");
  if (req.body.password === motherPassword)
    return res.status(200).send("match");
  else if (req.body.password !== motherPassword)
    return res.status(401).send("wrong");
  res.status(400).send("known error");
});

module.exports = router;
