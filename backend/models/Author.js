const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: String,
  picture: String,
  isAlive: {type: Boolean, default: true},
  genres: [String],
  description: String,
});

module.exports = mongoose.model("Author", authorSchema);