import { NextResponse } from "next/server";

export const successResponse = (
  message = "Operation completed successfully.",
  data = null,
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "success",
      code: 200,
      message,
      data,
      meta,
    },
    { status: 200 }
  );
};

export const createdResponse = (
  message = "Resource created successfully.",
  data = null,
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "success",
      code: 201,
      message,
      data,
      meta,
    },
    { status: 201 }
  );
};

export const errorResponse = (
  message = "An error occurred.",
  code = 400,
  errors = [],
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code,
      message,
      errors,
      meta,
    },
    { status: code }
  );
};

export const notFoundResponse = (
  message = "Resource not found.",
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 404,
      message,
      meta,
    },
    { status: 404 }
  );
};

export const unauthorizedResponse = (
  message = "Unauthorized access.",
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 401,
      message,
      meta,
    },
    { status: 401 }
  );
};

export const serviceUnavailableResponse = (
  message = "Service unavailable.",
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 503,
      message,
      meta,
    },
    { status: 503 }
  );
};

export const internalServerErrorResponse = (
  message = "Internal server error.",
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 500,
      message,
      meta,
    },
    { status: 500 }
  );
};

export const tooManyRequestsResponse = (
  message = "Too many requests.",
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 429,
      message,
      meta,
    },
    { status: 429 }
  );
};

export const unprocessableEntityResponse = (
  message = "Unprocessable entity.",
  errors = [],
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 422,
      message,
      errors,
      meta,
    },
    { status: 422 }
  );
};

export const conflictResponse = (message = "Conflict.", meta = {}) => {
  return NextResponse.json(
    {
      status: "error",
      code: 409,
      message,
      meta,
    },
    { status: 409 }
  );
};

export const forbiddenResponse = (message = "Access forbidden.", meta = {}) => {
  return NextResponse.json(
    {
      status: "error",
      code: 403,
      message,
      meta,
    },
    { status: 403 }
  );
};

export const badRequestResponse = (
  message = "Bad request.",
  errors = [],
  meta = {}
) => {
  return NextResponse.json(
    {
      status: "error",
      code: 400,
      message,
      errors,
      meta,
    },
    { status: 400 }
  );
};

export const noContentResponse = (message = "No content.") => {
  return NextResponse.json(
    {
      status: "success",
      code: 204,
      message,
      data: null,
    },
    { status: 204 }
  );
};
