import { generateCsrfToken } from "@/app/config/generateToken";
import { successResponse } from "./apiResponse";

export async function GET(req) {
  const csrfToken = generateCsrfToken();
  const response = successResponse("!!!Welcome to this medicine api!!!");
  response.cookies.set("csrf-token", csrfToken, {
    httpOnly: true,
    secure: process.env.ENV === "production" || process.env.ENV === "pilot",
    sameSite: "Strict",
  });

  return response;
}
