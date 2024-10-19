import logger from "@/app/logger";
import { emailSchema, loginSchema } from "@/app/validations/userValidation";
const User = require("@/app/models/UserModel");
const emailjs = require("@emailjs/nodejs");
const {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  internalServerErrorResponse,
  notFoundResponse,
} = require("@/app/api/apiResponse");
const {
  generateAccessToken,
  generateAndStoreRefreshToken,
  generateCsrfToken,
  generateAndStoreVerificationToken,
} = require("@/app/config/generateToken");

await require("@/app/config/db")();

export async function GET(req) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    const { error } = emailSchema({ email });
    if (error) {
      logger.error(
        "Error in GET /authentication/login -- " +
          error.details[0].message +
          " -- " +
          error
      );
      return badRequestResponse(error.details[0].message, error);
    }
    const newUser = await User.findOne({ email });

    if (!newUser) {
      return badRequestResponse("User not found.");
    }

    if (newUser.isVerified) {
      return badRequestResponse("Email already verified.");
    }

    if (newUser.otpAttempt >= 3) {
      newUser.role = "blocked";
      await newUser.save();
      return serviceUnavailableResponse(
        "Reached maximum number of attemps. Your account is blocked for not validating the the email in 3 attemps."
      );
    }
    const verificationToken = await generateAndStoreVerificationToken(
      newUser._id
    );
    const verificationUrl = `${process.env.FRONTEND_URL}/api/authentication/register?token=${verificationToken}`;

    if (
      process.env.NODE_ENV === "production" ||
      process.env.ALLOW_EMAIL === "true"
    ) {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        { name: newUser.name, verificationUrl, email },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );
    } else {
      logger.info("Email sending is disabled in non-prod environment");
    }

    newUser.otpAttempt += 1;
    await newUser.save();

    return successResponse("Verification email sent successfully.");
  } catch (error) {
    logger.error("Some Error Occured in GET /authentication/login -- " + error);
    return internalServerErrorResponse(
      "An error occurred while processing your request.",
      error
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { error } = loginSchema.validate(body);
    if (error) {
      logger.error(
        "Error in POST /authentication/login -- " +
          error.details[0].message +
          " -- " +
          error
      );
      return badRequestResponse(error.details[0].message, error);
    }
    const { email, password } = body;
    const user = await User.findOne({ email });
    if (!user) {
      return notFoundResponse("User not found");
    }
    if (!(await user.comparePassword(password))) {
      return unauthorizedResponse("Invalid credentials");
    }
    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateAndStoreRefreshToken(user._id);
    const csrfToken = generateCsrfToken();
    return successResponse(
      "Login Successful",
      {
        user: { name: user.name },
        accessToken,
      },
      csrfToken,
      refreshToken
    );
  } catch (error) {
    logger.error(
      "Some Error Occured in POST /authentication/login -- " + error
    );
    return internalServerErrorResponse("Internal Server Error", error);
  }
}
