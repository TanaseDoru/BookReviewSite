const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: String,
  picture: String,
  born: String,
  isAlive: Boolean,
  died: String,
  genres: [String],
  description: String,
});

module.exports = mongoose.model("Author", authorSchema);