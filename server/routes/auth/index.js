const express = require("express");
const router = express.Router();
const passport = require("passport");
const nativeSignInMiddleware = passport.authenticate("local", { session: false });
// Controllers
const Auth = require("../controllers/authentication");

// Issue jwt
router.post("/login", nativeSignInMiddleware, Auth.signInUser);

// Beg man for jwt
router.post("/register", Auth.registerUser);

module.exports = router;