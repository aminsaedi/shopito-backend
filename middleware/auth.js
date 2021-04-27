const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // const token = req.header("x-auth-token");
  // if (!token) return res.status(401).send("No token provided.");
  // try {
  //   const decode = jwt.verify(token, config.get("shopitoKey"));
  //   req.user = decode;
  //   next();
  // } catch (error) {
  //   res.send("Invalid token.").status(401);
  // }
  next();
};
