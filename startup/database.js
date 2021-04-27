const config = require("config");
const mongoose = require("mongoose");

module.exports = function () {
  const db = config.get("dbShopito");
  console.log("Database address is :", db);
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to database"));
  mongoose.set("useFindAndModify", false);
};
