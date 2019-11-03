const express = require("express");
const path = require("path");
const BUNDLE = path.resolve(__dirname, "../client/build", "index.html");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passportService = require("./services/passport");
const passport = require("passport");

const MONGO_URI = "mongodb://localhost:27017/invoke-alpha";

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

// const apiRoutes = require("./routes/api");
// const authRoutes = require("./routes/auth");

const app = express();

app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// set public dir for app
app.use("/", express.static(path.join(__dirname, "../client", "build")));
app.get("/auth/linkedin/cb", (req, res) => {
    res.status(200).send({ message: "success" });
});

// routes
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// app.use("/api", apiRoutes);
// app.use("/", authRoutes);

// serve app
app.get("*", (req, res) => res.sendFile(BUNDLE));

module.exports = app;