import emailjs from "@emailjs/nodejs";
import User from "@/app/models/UserModel";
import logger from "@/app/logger";
import {
  badRequestResponse,
  errorResponse,
  internalServerErrorResponse,
  successResponse,
  tooManyRequestsResponse,
} from "../../apiResponse";
import {
  sendOTPSchema,
  verifyOTPSchema,
} from "@/app/validations/userValidation";
import connectDB from "@/app/config/db";
import { verifyOtp } from "../../helpers";

// req to send OTP
export async function GET(req) {
  try {
    await connectDB();
    const email = req.nextUrl.searchParams.get("email");

    const { error } = sendOTPSchema.validate({ email });
    if (error) {
      logger.error(
        "Error in GET authentication/otp " +
          error.details[0].message +
          " -- " +
          error
      );
      return badRequestResponse(error.details[0].message, error);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return badRequestResponse("User not found.");
    }

    if (
      user.otpTime &&
      new Date().getTime() - new Date(user.otpTime).getTime() > 30 * 60 * 1000
    ) {
      user.otpAttempt = 0;
    }

    if (user.otpAttempt >= 3) {
      return tooManyRequestsResponse(
        `Maximum Attempt exceded. Please try after ${
          32 -
          Math.ceil(
            (new Date().getTime() - new Date(user.otpTime).getTime()) / 60000
          )
        } minutes.`
      );
    }
    const otp = Math.floor(Math.random() * 1000000 + 100000);

    if (
      process.env.NODE_ENV === "production" ||
      process.env.ALLOW_EMAIL === "true"
    ) {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID_OTP,
        { name: user.name, otp, email, text: "reset your password" },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );
    } else {
      logger.info("Email sending is disabled in non-prod environment");
    }

    if (user.otpAttempt) user.otpAttempt += 1;
    else user.otpAttempt = 1;
    if (user.otpAttempt == 1) user.otpTime = Date.now();
    user.otpSendTime = Date.now();
    user.otp = otp;
    await user.save();

    return successResponse("OTP sent successfully");
  } catch (error) {
    logger.error("Error sending OTP -- " + error);
    return internalServerErrorResponse("Error sending OTP. Please try again.");
  }
}

// req to verify OTP
export async function POST(req) {
  try {
    const body = await req.json();

    const { error } = verifyOTPSchema.validate(body);
    if (error) {
      logger.error(
        "Error in POST authentication/otp -- " +
          error.details[0].message +
          " -- " +
          error
      );
      return badRequestResponse(error.details[0].message, error);
    }

    const { email, OTP } = body;
    const user = await User.findOne({ email });

    if (!user) {
      return badRequestResponse("User not found.");
    }

    const res = await verifyOtp(user, OTP);
    if (res.isVerified) {
      return successResponse(res.message);
    } else {
      return errorResponse(req.message);
    }
  } catch (error) {
    logger.error("Error verifying OTP -- " + error);
    return internalServerErrorResponse(
      "Error verifying OTP. Please try again."
    );
  }
}
