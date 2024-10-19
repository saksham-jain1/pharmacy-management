import { SignJWT } from "jose";
const RefreshToken = require("@/app/models/RefreshTokenModel");
const VerificationToken = require("@/app/models/VerificationTokenModel");
const { v4 } = require("uuid");

const generateAccessToken = async (userId) => {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(secret);
};

const generateCsrfToken = () => {
  return v4(); // Generates a random UUID that can be used as a CSRF token
};

const generateAndStoreVerificationToken = async (userId) => {
  const secret = new TextEncoder().encode(process.env.VERIFICATION_TOKEN_SECRET);
  const token = v4();

  await VerificationToken.create({ userId, token });
  return await new SignJWT({ userId, token })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret); // Generates a random UUID that can be used as a CSRF token
};

const generateAndStoreRefreshToken = async (userId) => {
  const secret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);

  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  await RefreshToken.create({
    userId,
    token: refreshToken,
  });
  return refreshToken;
};

module.exports = {
  generateAccessToken,
  generateAndStoreRefreshToken,
  generateCsrfToken,
  generateAndStoreVerificationToken,
};
