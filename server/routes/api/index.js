const express = require("express");
const router = express.Router();
// Routes
const mapRoutes = require("./routes/map");
const linesRoutes = require("./routes/lines");
const nearbyRoutes = require("./routes/nearby");
const arrivalsRoutes = require("./routes/arrivals");
const stationsRoutes = require("./routes/stations");
const alertRoutes = require("./routes/alerts");
// City routes
const bayAreaRoutes = require("./routes/bayArea");
const chicagoRoutes = require("./routes/chicago");
const nycRoutes = require("./routes/nyc");
// Middleware
const passport = require("passport");
const authMiddleware = passport.authenticate("jwt", { session: false });

// Adds auth middleware to all routes
router.use("/", authMiddleware);
router.use("/alerts", alertRoutes);
router.use("/lines", linesRoutes);
router.use("/nearby", nearbyRoutes);
router.use("/arrivals", arrivalsRoutes);
router.use("/stations", stationsRoutes);
router.use("/map", mapRoutes);

// Cities
router.use("/bay", bayAreaRoutes);
router.use("/chicago", chicagoRoutes);
router.use("/nyc", nycRoutes);

module.exports = router;
