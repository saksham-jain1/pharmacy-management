const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensure category names are unique
      minlength: 2, // Category name should have at least 2 characters
      maxlength: 100, // Category name should not exceed 100 characters
    },
  },
  { timestamps: true }
);

const Category =
  mongoose?.models?.Category || mongoose.model("Category", categorySchema);

module.exports = Category;
