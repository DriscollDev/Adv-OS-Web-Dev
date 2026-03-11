const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("./db.js");

// Configure passport to use local strategy
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      // Find user by username
      const user = await db.findUserByUsername(username);

      // Check if user exists
      if (!user) {
        return cb(null, false, { message: "Incorrect username or password." });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return cb(null, false, { message: "Incorrect username or password." });
      }

      console.log(`User ${user.username} authenticated`);
      return cb(null, user);
    } catch (err) {
      console.log("Authentication error:", err);
      return cb(err);
    }
  })
);

// Serialize user for the session
passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user._id, username: user.username });
  });
});

// Deserialize user from the session
passport.deserializeUser(async (user, cb) => {
  try {
    const fullUser = await db.findUserById(user.id);
    process.nextTick(() => {
      return cb(null, fullUser);
    });
  } catch (err) {
    return cb(err);
  }
});

const authController = {
  registerUser: async (req, res) => {
    try {
      const { username, email, password, passwordConfirm } = req.body;

      // Validation
      if (!username || !email || !password || !passwordConfirm) {
        return res.render("register", {
          title: "Register",
          errorMessage: "Please provide all required fields."
        });
      }

      if (password !== passwordConfirm) {
        return res.render("register", {
          title: "Register",
          errorMessage: "Passwords do not match."
        });
      }

      if (password.length < 6) {
        return res.render("register", {
          title: "Register",
          errorMessage: "Password must be at least 6 characters long."
        });
      }

      // Check if user already exists
      const existingUser = await db.findUserByUsername(username);
      if (existingUser) {
        return res.render("register", {
          title: "Register",
          errorMessage: "Username is already in use."
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      await db.createUser(username, email, hashedPassword);

      return res.render("register", {
        title: "Register",
        errorMessage: "User registered successfully! Please log in."
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.render("register", {
        title: "Register",
        errorMessage: "An error occurred during registration."
      });
    }
  },

  loginUser: async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.render("login", {
          title: "Login",
          errorMessage: info.message || "Login failed."
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    })(req, res, next);
  },

  updateUserPassword: async (username, hashedPassword) => {
    try {
      return await db.updateUserPassword(username, hashedPassword);
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  }
};

module.exports = authController;
