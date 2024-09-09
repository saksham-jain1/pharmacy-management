const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3, // Ensure name is at least 3 characters long
      maxlength: 100, // Ensure name does not exceed 100 characters
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    invoiceNo: {
      type: Number,
      required: true,
      min: 1, // Ensure the invoice number is positive
      unique: true, // Ensure each invoice number is unique
    },
    address: {
      type: String,
      required: true,
      minlength: 3, // Ensure address is at least 3 characters long
      maxlength: 300, // Ensure address does not exceed 300 characters
    },
    notes: {
      type: [String], // Notes is an array of strings
      validate: {
        validator: function (v) {
          return v.every((note) => note.length <= 500); // Ensure each note does not exceed 500 characters
        },
        message: "Each note should not exceed 500 characters.",
      },
    },
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields
);

// Indexes for faster queries on frequently searched fields
shopSchema.index({ name: 1, userId: 1 });
shopSchema.index({ address: "text" }); // Full-text search on address if needed

const Shop = mongoose?.models?.Shop || mongoose.model("Shop", shopSchema);

module.exports = Shop;
