const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
require("dotenv").config();

const db = require("./controllers/db.js");
const authRouter = require("./routers/authRouter.js");
const homeRouter = require("./routers/homeRouter.js");

// Initialize app
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Authentication middleware
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
};

const checkNotAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
};

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use("/", homeRouter);
app.use("/auth", authRouter);


// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await db.connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;