const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: String,
  username: String,
  password: String,
  toggleOnOffPermis: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
