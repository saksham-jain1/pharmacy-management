import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { unauthorizedResponse } from "./app/api/apiResponse";

const rateLimitMap = new Map();

const corsOptions = {
  local: {
    origin: "https://your-production-domain.com",
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
  },
  production: {
    origin: ["https://your-production-domain.com"],
    methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
  },
};

function corsMiddleware(req) {
  const env = process.env.ENV;
  const corsConfig = corsOptions[env] || corsOptions["local"];

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", corsConfig.origin);
  res.headers.set("Access-Control-Allow-Methods", corsConfig.methods);
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  return res;
}

function rateLimitMiddleware(req) {
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("remote-addr");
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    const userData = rateLimitMap.get(ip);
    userData.count += 1;

    // Reset count after the window has passed (e.g., 15 minutes)
    if (now - userData.startTime > 15 * 60 * 1000) {
      userData.count = 1;
      userData.startTime = now;
    } else if (userData.count > 100) {
      return false;
    }
    rateLimitMap.set(ip, userData);
  }

  return true;
}

const excludedRoutes = [
  "/api/authentication/login",
  "/api/authentication/register",
  "/api/authentication/refresh-token",
  "/api/authentication/otp",
  "/api/",
];

export async function middleware(req) {
  corsMiddleware(req);

  const isRateLimited = rateLimitMiddleware(req);
  if (!isRateLimited) {
    return NextResponse.json(
      {
        status: "error",
        code: 429,
        message: "Too many requests, please try again later.",
      },
      { status: 429 }
    );
  }

  const url = req.nextUrl.pathname;
  if (excludedRoutes.includes(url)) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return unauthorizedResponse();
  }
  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    return unauthorizedResponse();
  }
  try {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    // if (["POST", "PUT", "DELETE"].includes(req.method)) {
    //   const csrfToken = req.headers.get("x-csrf-token");
    //   const sessionToken = req.cookies.get("csrfToken");
    //   if (csrfToken !== sessionToken) {
    //     return unauthorizedResponse("CSRF token mismatch");
    //   }
    // }
    const response = NextResponse.next();
    response.headers.set("X-Custom-Data", JSON.stringify(payload));
    return response;
  } catch (err) {
    if (err.name === "JWTExpired") {
      const refreshToken = req.cookies.get("refreshToken");
      if (!refreshToken) {
        return NextResponse.redirect("/login");
      }

      try {
        const response = await fetch(
          new URL("/api/authentication/refresh-token", req.url),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken.value}`,
            },
          }
        );

        if (response.status === 200) {
          const res = NextResponse.next();

          const data = await response.json();

          res.headers.set("Authorization", `Bearer ${data.newAccessToken}`);
          return res;
        }
        return NextResponse.redirect("/login");
      } catch (refreshErr) {
        if (refreshErr.name === "TokenExpiredError") {
          return unauthorizedResponse("Token expired").redirect("/login");
        } else {
          return unauthorizedResponse();
        }
      }
    } else {
      return unauthorizedResponse();
    }
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
