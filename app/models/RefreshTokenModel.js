const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema(
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

RefreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const RefreshToken =
  mongoose?.models?.RefreshToken ||
  mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
