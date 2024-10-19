const Joi = require("joi");

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registrationSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp("(?=.*[a-z])"))
    .pattern(new RegExp("(?=.*[A-Z])"))
    .pattern(new RegExp("(?=.*[0-9])"))
    .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password cannot exceed 30 characters.",
      "string.pattern.base": `Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*).`,
    }),
  aadharNo: Joi.string()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid Aadhaar Number",
      "string.empty": "Aadhaar Number is required.",
    }),
  licenseNo: Joi.string().alphanum().required(),
  gstNo: Joi.string()
    .pattern(
      new RegExp(
        "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$"
      )
    )
    .messages({
      "string.pattern.base": "GST Number is invalid.",
    }),
  mobileNo: Joi.string()
    .pattern(/^\+?\d{1,4}[-.\s]?\d{10}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid Phone Number. It should include a valid country code or a 10-digit number.",
      "string.empty": "Phone Number is required.",
    }),
  image: Joi.string(),
});

export const sendOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
});

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),
  OTP: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "OTP must be 6 digits long",
      "string.pattern.base": "OTP must contain only numbers",
      "string.empty": "OTP is required",
    }),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const updateSchema = Joi.object({
  key: Joi.string()
    .valid(
      "name",
      "email",
      "aadharNo",
      "licenseNo",
      "gstNo",
      "mobileNo",
      "image"
    )
    .required()
    .messages({ "any.only": "Invalid key to update." }),

  value: Joi.when("key", {
    switch: [
      {
        is: "name",
        then: Joi.string().min(3).max(50).required().messages({
          "string.min": "Name must be at least 3 characters long",
          "string.max": "Name must be at most 50 characters long",
        }),
      },
      {
        is: "email",
        then: Joi.string().email().required().messages({
          "string.email": "Invalid email format",
        }),
      },
      {
        is: "aadharNo",
        then: Joi.string()
          .pattern(/^\d{12}$/)
          .required()
          .messages({
            "string.pattern.base": "Invalid Aadhaar Number",
            "string.empty": "Aadhaar Number is required.",
          }),
      },
      {
        is: "licenseNo",
        then: Joi.string().alphanum().required(),
      },
      {
        is: "gstNo",
        then: Joi.string()
          .pattern(
            new RegExp(
              "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$"
            )
          )
          .messages({
            "string.pattern.base": "GST Number is invalid.",
          }),
      },
      {
        is: "mobileNo",
        then: Joi.string()
          .pattern(/^\+?\d{1,4}[-.\s]?\d{10}$/)
          .required()
          .messages({
            "string.pattern.base":
              "Invalid Phone Number. It should include a valid country code or a 10-digit number.",
            "string.empty": "Phone Number is required.",
          }),
      },
      {
        is: "image",
        then: Joi.string().uri().required().messages({
          "string.uri": "Image must be a valid URI",
        }),
      },
    ],
    otherwise: Joi.forbidden().messages({
      "any.only": "Invalid value provided for the selected key",
    }),
  }),
  otp: Joi.when("key", {
    is: Joi.valid("email", "mobileNo"),
    then: Joi.string()
      .length(6)
      .regex(/^[0-9]+$/)
      .required()
      .messages({
        "string.length": "OTP must be 6 digits",
        "string.pattern.base": "OTP must contain only digits",
      }),
    otherwise: Joi.forbidden(), // OTP is not required for other keys
  }),
});

export const passwordChangeSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp("(?=.*[a-z])"))
    .pattern(new RegExp("(?=.*[A-Z])"))
    .pattern(new RegExp("(?=.*[0-9])"))
    .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password cannot exceed 30 characters.",
      "string.pattern.base": `Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*).`,
    }),
  oldPassword: Joi.string().min(6),
  otp: Joi.Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .messages({
      "string.length": "OTP must be 6 digits long",
      "string.pattern.base": "OTP must contain only numbers",
      "string.empty": "OTP is required",
    }),
}).xor("otp", "oldPassword");
