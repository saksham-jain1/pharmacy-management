const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    medId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Quantity must be at least 1
    },
    power: {
      type: String,
      minlength: 1, // Ensure power is at least 1 character long
      maxlength: 50, // Ensure power does not exceed 50 characters
    },
    size: {
      type: String,
      minlength: 1, // Ensure size is at least 1 character long
      maxlength: 50, // Ensure size does not exceed 50 characters
    },
    price: {
      type: Number, // Price should be a number
      required: true,
      min: 0.01, // Ensure price is at least 0.01
    },
    mfgDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v < Date.now();
        },
        message: "Manufacturing date cannot be in the future.",
      },
    },
    expDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > Date.now();
        },
        message: "Expiry date must be in the future.",
      },
    },
    comment: {
      type: String,
      required: true,
      minlength: 3, // Ensure comment is at least 3 characters long
      maxlength: 300, // Ensure comment does not exceed 300 characters
    },
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

// Ensure that the manufacturing date is before the expiry date
stockSchema.pre("save", function (next) {
  if (this.mfgDate >= this.expDate) {
    return next(
      new Error("Manufacturing date must be before the expiry date.")
    );
  }
  next();
});

stockSchema.index(
  { deleteRequestDate: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Stock = mongoose?.models?.St || mongoose.model("Stock", stockSchema);

module.exports = Stock;
