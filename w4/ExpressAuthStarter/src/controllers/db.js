const mongoose = require("mongoose");
const User = require("../../models/user.js");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Find user by username
const findUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    console.error("Error finding user by username:", error);
    throw error;
  }
};

// Find user by ID
const findUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

// Create new user
const createUser = async (username, email, hashedPassword) => {
  try {
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    await user.save();
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update user password
const updateUserPassword = async (username, hashedPassword) => {
  try {
    const user = await User.findOneAndUpdate(
      { username },
      { password: hashedPassword },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

module.exports = {
  connectDB,
  findUserByUsername,
  findUserById,
  createUser,
  updateUserPassword
};
