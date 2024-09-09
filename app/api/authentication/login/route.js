import logger from "@/app/logger";
const User = require("@/models/UserModel");
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
  generateCsrfToken
} = require("@/config/generateToken");
const { loginSchema } = require("@/validations/userValidation");

await require("@/config/db")();

export async function POST(req) {
  try {
    const body = await req.json();
    const { error } = loginSchema.validate(body);
    if (error) {
      logger.error(error.details[0].message, error);
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
    const response = successResponse("Login Successful", {
      user: { name: user.name },
      accessToken,
    });
    response.cookies.set("csrf-token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    response.cookies.set("refreshToken", refreshToken, {
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
