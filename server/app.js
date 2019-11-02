const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const BUNDLE = path.resolve(__dirname, "../client/build", "index.html");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// set public dir for app
app.use("/", express.static(path.join(__dirname, "../client", "build")));

// routes
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// serve app
app.get("*", (req, res) => res.sendFile(BUNDLE));

module.exports = app;
