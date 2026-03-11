const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "Home", errorMessage: null, user: req.user });
});

module.exports = router;
