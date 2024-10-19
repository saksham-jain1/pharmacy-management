const mongoose = require("mongoose");

const VerificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    token: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

VerificationTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const VerificationToken =
  mongoose?.models?.VerificationToken ||
  mongoose.model("VerificationToken", VerificationTokenSchema);

module.exports = VerificationToken;
