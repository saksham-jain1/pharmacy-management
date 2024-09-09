import { jwtVerify } from "jose";
import {
  generateAccessToken,
  generateAndStoreRefreshToken,
} from "@/config/generateToken";
import RefreshToken from "@/models/RefreshTokenModel";
import connectDB from "@/config/db";
import { unauthorizedResponse, successResponse } from "@/app/api/apiResponse";

export async function GET(req) {
  await connectDB();

  const refreshToken = req.headers.get("Authorization").split("Bearer ")[1];
  if (!refreshToken) {
    return unauthorizedResponse("No refresh token provided.");
  }

  try {
    const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const { payload } = await jwtVerify(refreshToken, secret);

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: payload.userId,
    });

    if (!storedToken) {
      return unauthorizedResponse("Invalid token.");
    }

    const newAccessToken = await generateAccessToken(payload.userId);
    const newRefreshToken = await generateAndStoreRefreshToken(payload.userId);

    await RefreshToken.deleteOne({
      token: refreshToken,
      userId: payload.userId,
    });

    const res = successResponse("Token refreshed successfully.", {
      newAccessToken,
    });
    res.headers.set("Authorization", `Bearer ${newAccessToken}`);
    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res;
  } catch (error) {
    return unauthorizedResponse("Token verification failed.");
  }
}
