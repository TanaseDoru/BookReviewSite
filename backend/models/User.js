const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" }, // Store as a URL or Base64
  createdAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ["admin", "user", "author"], // Restrict values to admin, user, or author
    default: "user", // Default role is "user"
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author", // Reference to the "authors" collection
    required: function () {
      return this.role === "author"; // Required only if role is "author"
    },
  },
  isActive: {
    type: Boolean,
    default: true, // Utilizatorul este activ implicit
  },
});

// Ensure the model name matches the collection name in the database
module.exports = mongoose.model("User", userSchema);