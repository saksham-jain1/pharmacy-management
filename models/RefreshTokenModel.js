const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  token: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" },
});

const RefreshToken =
  mongoose?.models?.RefreshToken ||
  mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
