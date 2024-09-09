const mongoose = require("mongoose");

const manufacturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
      minlength: 2, // Manufacturer name should have at least 2 characters
      maxlength: 100, // Manufacturer name should not exceed 100 characters
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  { timestamps: true }
);

const Manufacturer =
  mongoose?.models?.Manufacturer ||
  mongoose.model("Manufacturer", manufacturerSchema);

module.exports = Manufacturer;
