import { SignJWT, jwtVerify } from "jose"; // Use import if ES modules or require for commonJS
const RefreshToken = require("@/models/RefreshTokenModel");
const VerificationToken = require("@/models/VerificationTokenModel");
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

const verifyCsrfToken = (receivedToken, storedToken) => {
  if (receivedToken !== storedToken) {
    throw new Error("CSRF token mismatch");
  }
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

const generateAndStoreVerificationToken = async (userId) => {
  const secret = new TextEncoder().encode(
    process.env.VERIFICATION_TOKEN_SECRET
  );

  const verificationToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  await VerificationToken.create({
    userId,
    token: verificationToken,
  });

  return verificationToken;
};

module.exports = {
  generateAccessToken,
  generateAndStoreRefreshToken,
  verifyCsrfToken,
  generateCsrfToken,
  generateAndStoreVerificationToken,
};
