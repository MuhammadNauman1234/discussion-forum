const express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
var cookieParser = require("cookie-parser");
var userRouter = require("./routes/routes");

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}
const app = express();

app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use("/", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
