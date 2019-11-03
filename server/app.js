const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const got = require("got");

// Auth deps
const bcrypt = require("bcrypt");
const User = require("./models/User");
const jwt = require("jsonwebtoken");

// Mongo deps
const mongoose = require('mongoose');
const MONGO_URI = "mongodb://localhost:27017/invoke-alpha";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// set public dir for app
app.use("/", express.static(path.join(__dirname, "../client", "build")));

const LINKEDIN_CLIENT_SECRET = "k36pJmOOISyOeUsn";

app.post("/auth/linkedin", async (req, res) => {
  const { body } = req;
  const formBody = {
    grant_type: "authorization_code",
    code: body.authorizationCode,
    redirect_uri: "http://localhost:3000/auth",
    client_id: "86n2guu7lpgeen",
    client_secret: LINKEDIN_CLIENT_SECRET
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

  // Check if email in use
  // If not proceed with...
  User.findOne({ email: req.body.email })
    .exec()
    .then(function(user) {
      if (user) {
        return res.status(400).json({
          message: "A user already exists with that email address"
        });
      }

      // Hashing of password
      // Creating a new User();
      // Saving them to the db
      // Returning a JWT
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) {
          // Denotes bcrypt error
          return res.status(500).json({
            message: "Error creating new user"
          });
        } else {
          const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash
          });

          newUser
            .save()
            .then(function(result) {
              console.log("** New user created: **", result);

              // Issue JWT here
              res.status(200).json({
                success: "New user created successfully",
                token: null
              });
            })
            .catch(error => {
              // Denotes mongo error
              return res.status(500).json({
                message: "Error saving new user"
              });
            });
        }
      });
      // End bcrypt
    })
    .catch(error => {
      return res.status(500).json({
        message: "Error creating new user"
      });
    });
});

app.post("/auth/native/signin", (req, res) => {
  // Find user in DB
  // Then bcrympt compare against the user's stored hashed password
  // If result === true, issue JWT
  User.findOne({ email: req.body.email })
    .exec()
    .then(function(user) {
      bcrypt.compare(req.body.password, user.password, function(err, result) {
        if (err) {
          return res.status(401).json({
            failed: "Unauthorized Access"
          });
        }
        if (result) {
          const JWTToken = jwt.sign(
            {
              email: user.email,
              _id: user._id
            },
            "secret",
            {
              expiresIn: "2h"
            }
          );
          return res.status(200).json({
            success: "Welcome to the JWT Auth",
            token: JWTToken
          });
        }
        return res.status(401).json({
          failed: "Unauthorized Access"
        });
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

// serve app
const BUNDLE = path.resolve(__dirname, "../client/build", "index.html");
app.get("*", (req, res) => res.sendFile(BUNDLE));

module.exports = app;
