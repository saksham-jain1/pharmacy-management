import { EmailTemplate } from "@/app/email-templates/verificationMail";
import { Resend } from "resend";

const logger = require("@/app/logger");
const {
  generateAccessToken,
  generateAndStoreRefreshToken,
  generateCsrfToken,
} = require("@/app/config/generateToken");
const User = require("@/app/models/UserModel");
const {
  successResponse,
  conflictResponse,
  badRequestResponse,
  internalServerErrorResponse,
  errorResponse,
} = require("@/app/api/apiResponse");
const { registrationSchema } = require("@/app/validations/userValidation"); // Adjust the path as necessary
require("@/app/config/db")();

export async function POST(req) {
  try {
    const body = await req.json();
    const { error } = registrationSchema.validate(body);
    if (error) {
      logger.error(error.details[0].message, error);
      return badRequestResponse(error.details[0].message, error);
    }

    const {
      name,
      email,
      password,
      aadharNo,
      licenseNo,
      gstNo,
      mobileNo,
      image,
    } = body;

    if (!gstNo && !aadharNo) {
      return badRequestResponse("GST or Aadhar Number required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return conflictResponse("Email is already registered.");
    }

    const newUser = new User({
      name,
      email,
      password,
      aadharNo,
      licenseNo,
      gstNo,
      mobileNo,
      image,
      isVerified: false,
    });
    
    const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
    const { error: resendError } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Please Verify Your Email",
      react: EmailTemplate({ name }),
    });

    if (resendError) {
      return errorResponse("Error Sending Mail", 400, resendError);
    }

    await newUser.save();

    const accessToken = await generateAccessToken(newUser._id);
    const refreshToken = await generateAndStoreRefreshToken(newUser._id);
    const csrfToken = generateCsrfToken();


    const response = successResponse("Registration successful", {
      accessToken,
      refreshToken,
    });
    response.cookies.set("csrf-token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return response;
  } catch (error) {
    logger.error(error);
    return internalServerErrorResponse("Internal Server Error", error);
  }
}
