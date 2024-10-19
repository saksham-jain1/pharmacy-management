import VerificationToken from "@/app/models/VerificationTokenModel";
import { jwtVerify } from "jose";
const emailjs = require("@emailjs/nodejs");
const logger = require("@/app/logger");
const {
  generateAccessToken,
  generateAndStoreRefreshToken,
  generateCsrfToken,
  generateAndStoreVerificationToken,
} = require("@/app/config/generateToken");
const User = require("@/app/models/UserModel");
const {
  successResponse,
  conflictResponse,
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
} = require("@/app/api/apiResponse");
const { registrationSchema } = require("@/app/validations/userValidation"); // Adjust the path as necessary
require("@/app/config/db")();

export async function GET(req) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return badRequestResponse("Token is required.");
    }

    const secret = new TextEncoder().encode(
      process.env.VERIFICATION_TOKEN_SECRET
    );

    try {
      const { payload } = await jwtVerify(token, secret);
      const savedToken = await VerificationToken.findOne({
        userId: payload.userId,
        token: payload.token,
      });

      if (!savedToken) {
        return notFoundResponse("Invalid or expired token.");
      }

      const user = await User.findById(payload.userId);
      if (!user) {
        return notFoundResponse("User not found.");
      }

      user.isVerified = true;
      user.otpAttempt = 0;
      await user.save();

      await VerificationToken.deleteMany({ userId: payload.userId });

      const accessToken = await generateAccessToken(user._id);
      const refreshToken = await generateAndStoreRefreshToken(user._id);
      const csrfToken = generateCsrfToken();

      return successResponse("Email verified successfully.", {
        user: { name: user.name },
        accessToken,
      },csrfToken,refreshToken);
    } catch (error) {
      logger.error("JWT verification failed -- " + error);
      return notFoundResponse("Invalid or expired token.");
    }
  } catch (error) {
    logger.error("Error during email verification -- " + error);
    return internalServerErrorResponse("Internal Server Error", error);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { error } = registrationSchema.validate(body);
    if (error) {
      logger.error(
        "Validation error in POST authentication/register -- " +
          error.details[0].message +
          " -- " +
          error
      );
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

    const verificationToken = await generateAndStoreVerificationToken(
      newUser._id
    );
    const verificationUrl = `${process.env.FRONTEND_URL}/api/authentication/register?token=${verificationToken}`;

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID_URL,
        { name, verificationUrl, email },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );
    } catch (error) {
      logger.error("Error sending email -- " + error);
      return internalServerErrorResponse(
        "Error sending mail. Please try again.",
        error
      );
    }

    await newUser.save();

    const accessToken = await generateAccessToken(newUser._id);
    const refreshToken = await generateAndStoreRefreshToken(newUser._id);
    const csrfToken = generateCsrfToken();

    return successResponse(
      "Registration successful",
      {
        accessToken,
        refreshToken,
      },
      csrfToken,
      refreshToken
    );
  } catch (error) {
    logger.error("Error during registration -- " + error);
    return internalServerErrorResponse("Internal Server Error", error);
  }
}
