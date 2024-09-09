const Joi = require("joi");

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Registration validation schema
export const registrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
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
