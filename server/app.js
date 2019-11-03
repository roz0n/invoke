const express = require("express");
const path = require("path");
const BUNDLE = path.resolve(__dirname, "../client/build", "index.html");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const got = require("got");
const FormData = require("form-data");
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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// set public dir for app
app.use("/", express.static(path.join(__dirname, "../client", "build")));

const CLIENT_SECRET = "k36pJmOOISyOeUsn";
app.post("/auth/linkedin", async (req, res) => {
  const { body } = req;
  const form = new FormData();
  const formBody = {
    grant_type: "authorization_code",
    code: body.authorizationCode,
    redirect_uri: "http://localhost:3000/auth",
    client_id: "86n2guu7lpgeen",
    client_secret: CLIENT_SECRET
  };


  try {
    const reqAccessToken = await got.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        form: true,
        body: formBody,
      }
    );
    let accessToken;

    if (!reqAccessToken.body) {
      throw new Error();
    } else {
      accessToken = JSON.parse(reqAccessToken.body);
    }

    return res.status(200).send({
      message: "success",
      accessToken: accessToken.access_token,
      expiresIn: accessToken.expires_in
    });
  } catch (error) {
    return res.status(error.statusCode || 500).send({
      message: error.body
    });
  }
});

// routes
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// app.use("/api", apiRoutes);
// app.use("/", authRoutes);

// serve app
app.get("*", (req, res) => res.sendFile(BUNDLE));

module.exports = app;
