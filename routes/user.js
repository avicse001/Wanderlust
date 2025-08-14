const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { saveRedirectUrl } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

const userController = require("../controllers/users");

// =====================
// Register Form
// &
// Handle Register
// =====================
router.route("/register")
  .get(userController.renderRegisterForm)
  .post(wrapAsync(userController.register));

// =====================
// Login Form
// &
// Handle Login
// =====================
router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.login
  );

// =====================
// Logout
// =====================
router.get("/logout", userController.logout);

module.exports = router;
