const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address.",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    aadharNo: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{12}$/.test(v);
        },
        message: "Please enter a valid Aadhar number.",
      },
    },
    licenseNo: {
      type: String,
      required: true,
      unique: true,
      maxlength: 20,
    },
    gstNo: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
            v
          );
        },
        message: "Please enter a valid GST number.",
      },
    },
    mobileNo: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\+?\d{1,4}[-.\s]?\d{10}$/.test(v);
        },
        message: "Please enter a valid 10-digit mobile number.",
      },
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          return /^https?:\/\/\S+\.\S+$/.test(v);
        },
        message: "Invalid URL format for image.",
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "manager", "blocked"],
      default: "user",
    },
    otp: {
      type: Number,
      min: 100000,
      max: 999999,
    },
    otpAttempt: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    otpTime: {
      type: Date,
      default: null,
    },
    otpSendTime: {
      type: Date,
      default: null,
    },
    loginAttempt: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    loginTime: {
      type: Date,
      default: null,
    },
    verificationTime: {
      type: Date,
      default: null,
    },
    verificationAttempt: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    activePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
    },
    isVerified: {
      type: Boolean,
      default: false,
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

userSchema.index(
  { deleteRequestDate: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose?.models?.User || mongoose.model("User", userSchema);

module.exports = User;
