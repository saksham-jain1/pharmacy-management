const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true, // Add index for better query performance
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Pricing", // Updated reference to "Pricing" instead of "Plan"
      index: true, // Add index for better query performance
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now, // Set default to current date
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > this.startDate; // Ensure endDate is after startDate
        },
        message: "End date must be after the start date.",
      },
    },
    transactionId: {
      type: String,
      required: true,
      unique: true, // Ensure transactionId is unique
      trim: true, // Remove any leading or trailing whitespace
      minlength: 5, // Ensure transactionId is at least 5 characters long
      maxlength: 100, // Ensure transactionId does not exceed 100 characters
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Ensure amount is non-negative
      validate: {
        validator: function (v) {
          return Number.isInteger(v * 100); // Ensure amount is to two decimal places
        },
        message: "Amount must have at most two decimal places.",
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"], // Define status options
      default: "Pending", // Default status
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "Bank Transfer", "PayPal"], // Define payment methods
    },
    invoiceUrl: {
      type: String,
      trim: true, // Remove any leading or trailing whitespace
      validate: {
        validator: function (v) {
          return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Basic URL validation
        },
        message: "Invalid URL format.",
      },
    },
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields
);

const Billing =
  mongoose?.models?.Billing || mongoose.model("Billing", billingSchema);

module.exports = Billing;
