require("dotenv").config();
require("./models/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var statusRouter = require("./routes/status");
var machineRouter = require("./routes/machines");
var logsRouter = require("./routes/logs");
// // var createRouter = require("./routes/create");

var app = express();
const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/status", statusRouter);
app.use("/machines", machineRouter);
app.use("/logs", logsRouter);
// app.use("/create", createRouter);

module.exports = app;
