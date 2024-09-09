const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3, // Ensure name is at least 3 characters long
      maxlength: 100, // Ensure name does not exceed 100 characters
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true, // Ensure email is unique
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Simple regex for email validation
        },
        message: "Please enter a valid email address.",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Ensure password is at least 8 characters long
    },
    aadharNo: {
      type: String,
      required: true,
      unique: true, // Ensure Aadhar number is unique
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v); // Aadhar number should be exactly 12 digits
        },
        message: "Please enter a valid Aadhar number.",
      },
    },
    licenseNo: {
      type: String,
      required: true,
      unique: true, // Ensure license number is unique
      maxlength: 20, // Ensure license number does not exceed 20 characters
    },
    gstNo: {
      type: String,
      required: true,
      unique: true, // Ensure GST number is unique
      validate: {
        validator: function (v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
            v
          ); // GSTIN format validation
        },
        message: "Please enter a valid GST number.",
      },
    },
    mobileNo: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\+?\d{1,4}[-.\s]?\d{10}$/.test(v); // Mobile number should be exactly 10 digits
        },
        message: "Please enter a valid 10-digit mobile number.",
      },
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return /^https?:\/\/\S+\.\S+$/.test(v); // Simple regex to validate image URL format
        },
        message: "Invalid URL format for image.",
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "manager"], // Role can only be one of these values
      default: "user",
    },
    otp: {
      type: Number,
      min: 1000,
      max: 9999,
    },
    otpAttempt: {
      type: Number,
      min: 0,
      max: 3,
      default: 0, // Default OTP attempts to 0
    },
    otpTime: {
      type: Date,
      default: null,
    },
    loginAttempt: {
      type: Number,
      min: 0,
      max: 3,
      default: 0, // Default login attempts to 0
    },
    loginTime: {
      type: Date,
      default: null,
    },
    activePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Adding timestamps for createdAt and updatedAt fields
);

// Pre-save hook to enforce password hashing or other operations before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); // Hash the password before saving
  }
  next();
});

// Method to compare passwords for authentication
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose?.models?.User || mongoose.model("User", userSchema);

module.exports = User;
