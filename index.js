const express = require("express");
const config = require("config");
const path = require("path");
const app = express();

require("./startup/config")();
require("./startup/database")();
require("./startup/cros")(app);
require("./startup/routes")(app);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) =>
  res.render("index", {
    title: "صفحه اصلی سرور",
    subTitle: "Do not change anything !",
  })
);

const port = config.get("PORT");
app.listen(port, () => console.log("Listening on port " + port + " ..."));
