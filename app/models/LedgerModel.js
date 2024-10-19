const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Remove leading and trailing whitespaces
      minlength: 2, // Minimum length for name
      maxlength: 100, // Maximum length for name
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contact: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Regular expression to validate 10-digit phone numbers
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
      required: [true, "Contact number is required"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: 255, // Maximum length for address
    },
    type: {
      type: String,
      required: true,
      enum: ["Sale", "Purchase"],
    },
    DebitBalance: {
      type: Number,
      default: 0,
      min: [0, "Debit balance cannot be negative"], // Minimum value for DebitBalance
    },
    CreditBalance: {
      type: Number,
      default: 0,
      min: [0, "Credit balance cannot be negative"], // Minimum value for CreditBalance
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
  { timestamps: true }
);

ledgerSchema.index(
  { deleteRequestDate: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Ledger =
  mongoose?.models?.Ledger || mongoose.model("Ledger", ledgerSchema);

module.exports = Ledger;
