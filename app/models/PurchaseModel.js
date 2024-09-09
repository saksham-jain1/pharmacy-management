const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 3, // Ensure name is at least 3 characters long
      maxlength: 100, // Ensure name does not exceed 100 characters
    },
    items: {
      type: [
        {
          medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
            required: true,
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
        },
      ],
      validate: {
        validator: function (items) {
          // Check for duplicate medicine IDs
          const medicineIds = items.map((item) => item.medicineId.toString());
          return new Set(medicineIds).size === items.length;
        },
        message: "Duplicate medicines are not allowed.",
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Cancelled"], // Status can only be one of these values
      default: "Pending",
    },
  },
  { timestamps: true }
); // Adding timestamps for createdAt and updatedAt fields

const Purchase =
  mongoose?.models?.Purchase || mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
