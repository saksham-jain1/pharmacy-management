const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
      index: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (v) {
          return v <= Date.now();
        },
        message: "Transaction date cannot be in the future.",
      },
    },
    description: {
      type: String,
      maxlength: 500, // Ensure the description does not exceed 500 characters
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01, // Ensure amount is at least 0.01
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: "Transaction amount must be greater than zero.",
      },
    },
    type: {
      type: String,
      required: true,
      enum: ["Credit", "Debit"],
    },
    attachmentsUrl: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/\S+\.\S+$/.test(v); // Simple regex to validate URL format
          },
          message: "Invalid URL format for attachment.",
        },
      },
    ],
    deleteRequestDate: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields
);

transactionSchema.index(
  { deleteRequestDate: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// Pre-save hook to enforce business logic or other operations before saving
transactionSchema.pre("save", function (next) {
  // Example: Preventing zero or negative transactions for certain types
  if (this.amount <= 0) {
    return next(new Error("Transaction amount must be greater than zero."));
  }
  next();
});

const Transaction =
  mongoose?.models?.Transaction ||
  mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
