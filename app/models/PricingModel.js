const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true, // Plan name is required
      minlength: 3, // Ensure plan name is at least 3 characters long
      maxlength: 100, // Ensure plan name does not exceed 100 characters
    },
    price: {
      type: Number,
      required: true, // Price is required
      min: 0, // Ensure price is at least 0
      validate: {
        validator: function (v) {
          return Number.isInteger(v * 100); // Ensure price is to two decimal places
        },
        message: "Price must have at most two decimal places.",
      },
    },
    status: {
      type: String,
      required: true, // Status is required
      enum: ["Active", "Inactive", "Archived"], // Status can only be one of these values
      default: "Active", // Default status is "Active"
    },
    features: [
      {
        type: String,
        required: true, // Each feature is required
        minlength: 3, // Ensure each feature is at least 3 characters long
        maxlength: 200, // Ensure each feature does not exceed 200 characters
      },
    ],
    duration: {
      type: Number,
      required: true, // Duration is required
      min: 1, // Ensure duration is at least 1 (e.g., 1 month)
      max: 60, // Ensure duration does not exceed 60 (e.g., 5 years)
      validate: {
        validator: function (v) {
          return Number.isInteger(v); // Ensure duration is an integer
        },
        message: "Duration must be an integer value.",
      },
    },
    description: {
      type: String,
      maxlength: 500, // Ensure the description does not exceed 500 characters
    },
    type: {
      type: String,
      required: true, // Type is required
      enum: ["Subscription", "One-time"], // Type can only be "Subscription" or "One-time"
      default: "Subscription", // Default type is "Subscription"
    },
    purchases: {
      type: Number,
      default: 0, // Default purchases count is 0
      min: 0, // Ensure purchases are not negative
      validate: {
        validator: function (v) {
          return Number.isInteger(v); // Ensure purchases are an integer
        },
        message: "Purchases must be an integer value.",
      },
    },
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields
);

const Pricing =
  mongoose?.models?.Pricing || mongoose.model("Pricing", pricingSchema);

module.exports = Pricing;
