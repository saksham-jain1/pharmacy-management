const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      minlength: 3, // Ensure name is at least 3 characters long
      maxlength: 100, // Ensure name does not exceed 100 characters
    },
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
    items: {
      type: [
        {
          medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Medicine",
            required: true,
          },
          stockId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stock",
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
          price: {
            type: Number, // Price should be a number
            required: true,
            min: 1, // Ensure price is at least 0.01
          },
        },
      ],
      validate: {
        validator: function (items) {
          // Check for duplicate medicine IDs within the items array
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

sellSchema.index(
  { deleteRequestDate: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Sell = mongoose?.models?.Sell || mongoose.model("Sell", sellSchema);

module.exports = Sell;
