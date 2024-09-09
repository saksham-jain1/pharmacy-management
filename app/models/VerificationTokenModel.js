const mongoose = require("mongoose");

const VerificationTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  token: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" },
});

const VerificationToken =
  mongoose?.models?.VerificationToken ||
  mongoose.model("VerificationToken", VerificationTokenSchema);

module.exports = VerificationToken;
