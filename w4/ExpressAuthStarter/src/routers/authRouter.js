const express = require("express");
const authController = require("../controllers/authController.js");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { title: "Login", errorMessage: null, user: req.user });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Register", errorMessage: null, user: req.user });
});

router.post("/login", authController.loginUser);
router.post("/register", authController.registerUser);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;