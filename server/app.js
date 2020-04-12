const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const got = require("got");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const AuthService = require("./services/Auth");
const config = require("./config");
const mongoose = require("mongoose");
const MONGO_URI = "mongodb://localhost:27017/invoke-alpha";
const app = express();

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(AuthService.jwtMiddleware);
app.use("/", express.static(path.join(__dirname, "../client", "build")));

app.post("/auth/linkedin", async (req, res) => {
  const { body } = req;
  const formBody = {
    grant_type: "authorization_code",
    code: body.authorizationCode,
    redirect_uri: "http://localhost:3000/auth",
    client_id: "86n2guu7lpgeen",
    client_secret: config.linkedInSecret
  };

  try {
    const reqAccessToken = await got.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        form: true,
        body: formBody
      }
    );

    let accessToken, linkedInUser;

    if (!reqAccessToken.body) {
      throw new Error();
    } else {
      accessToken = JSON.parse(reqAccessToken.body);
    }

    return res.status(200).send({
      message: "success",
      accessToken: accessToken.access_token,
      expiresIn: accessToken.expires_in,
      userData: linkedInUser
    });
  } catch (error) {
    return res.status(error.statusCode || 500).send({
      message: error.body || "Error obtaining LinkedIn access token"
    });
  }
});

app.get("/auth/linkedin/user", async (req, res) => {
  const { headers } = req;
  const { authorization: accessToken } = headers;

  try {
    if (!accessToken) throw new Error();
    const headers = {
      "Content-type": "application/json",
      Authorization: `Bearer ${accessToken}`
    };
    const reqUserData = await got("https://api.linkedin.com/v2/me", {
      headers
    });
    const userData = JSON.parse(reqUserData.body);

    if (!userData) {
      throw new Error();
    } else {
      return res.status(200).send(userData);
    }
  } catch (error) {
    return res.status(error.statusCode || 500).send({
      message: error.body || "Error obtaining LinkedIn user data"
    });
  }
});

app.post("/auth/native/register", async (req, res) => {
  if (!req.body.password || !req.body.email) {
    return res.status(400).json({
      message: "Insufficient registration credentials provided"
    });
  }

  try {
    const findUser = await User.findOne({ email: req.body.email });

    if (!findUser) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({
      message: "A user already exists with that email address"
    });
  }

  try {
    bcrypt.hash(req.body.password, 10, async function(error, hash) {
      if (error) {
        return res.status(500).json({
          message: "Error creating new user"
        });
      }

      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash
      });

      const saveUserResult = await newUser.save();

      if (saveUserResult) {
        // TODO: issue JWT here
        res.status(200).json({
          success: "New user created successfully",
          token: null
        });
      } else {
        return res.status(500).json({
          message: "Error creating new user"
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating new user"
    });
  }
});

app.post("/auth/native/signin", async (req, res) => {
  if (!req.body.password || !req.body.email) {
    return res.status(400).json({
      message: "Invalid credentials provided"
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user || !user.password) {
      throw new Error();
    }

    bcrypt.compare(req.body.password, user.password, async function(
      error,
      result
    ) {
      if (error) {
        return res.status(500).json({
          failed: "Server error attempting to login user"
        });
      }

      const jwtToken = jwt.sign(
        {
          email: user.email,
          _id: user._id
        },
        config.jwtSecret,
        {
          expiresIn: "2h"
        }
      );

      return res.status(200).json({
        message: "success",
        token: jwtToken
      });
    });
  } catch (error) {
    return res.status(401).json({
      failed: "Unauthorized access, error locating user"
    });
  }
});

// serve app
const BUNDLE = path.resolve(__dirname, "../client/build", "index.html");
app.get("*", (req, res) => res.sendFile(BUNDLE));

module.exports = app;