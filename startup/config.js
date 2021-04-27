const config = require("config");
module.exports = function () {
  if (!config.get("shopitoKey"))
    throw new Error("Jwt key is not set ! plaese set DonePrivateKey.");
  if (!config.get("dbShopito"))
    throw new Error("db variable is not set! plase set db.");
};
