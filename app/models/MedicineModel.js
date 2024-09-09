const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
      minlength: 2, // Name should have at least 2 characters
      maxlength: 100, // Name should not exceed 100 characters
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    powers: [
      {
        type: String,
        required: true,
        minlength: 1, // Power should have at least 1 character
        maxlength: 50, // Power should not exceed 50 characters
      },
    ],
    sizes: [
      {
        type: String,
        required: true,
        minlength: 1, // Size should have at least 1 character
        maxlength: 50, // Size should not exceed 50 characters
      },
    ],
    keywords: [
      {
        type: String,
        minlength: 2, // Keyword should have at least 2 characters
        maxlength: 50, // Keyword should not exceed 50 characters
      },
    ],
    diseases: [
      {
        type: String,
        minlength: 2, // Disease should have at least 2 characters
        maxlength: 100, // Disease should not exceed 100 characters
      },
    ],
    description: {
      type: String,
      maxlength: 500, // Description should not exceed 500 characters
    },
  },
  { timestamps: true }
);

const Medicine =
  mongoose?.models?.Medicine || mongoose.model("Medicine", medicineSchema);

module.exports = Medicine;
