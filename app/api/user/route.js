import User from "@/app/models/UserModel";
import {
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  successResponse,
} from "../apiResponse";
import {
  passwordChangeSchema,
  updateSchema,
} from "@/app/validations/userValidation";
import { generateCsrfToken } from "@/app/config/generateToken";
import logger from "@/app/logger";
import { verifyOtp } from "../helpers";

export async function GET(req) {
  try {
    const id = JSON.parse(req.headers.get("X-Custom-Data") || "{}").userId;
    if (!id) {
      return badRequestResponse("Id can't be empty or null");
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return badRequestResponse("Invalid user ID format.");
    }

    const user = await User.findById(id);
    if (!user) {
      return notFoundResponse("User not found.");
    }
    const userData = {
      name: user.name,
    };
    const csrfToken = generateCsrfToken();
    return successResponse("Fetch Successfull", userData, csrfToken);
  } catch (error) {
    logger.error("Some Error Occured in GET /user -- " + error);
    return internalServerErrorResponse(
      "An error occurred while processing your request.",
      error
    );
  }
}

// todo verify otp and save the data and add validations. + verify working of this + otp verification.
// req to update user details except password.
export async function POST(req) {
  try {
    const body = await req.json();
    const { error } = updateSchema.validate(body);
    if (error) {
      logger.error(
        "Error in POST /user -- " + error.details[0].message + " -- " + error
      );
      return badRequestResponse(error.details[0].message, error);
    }
    const { key, value, otp } = body;
    const id = JSON.parse(req.headers.get("X-Custom-Data") || "{}").userId;
    if (!id) {
      return badRequestResponse("Id not found");
    }
    const user = await User.findById(id);
    if (key != "email" || key != "mobileNo") {
      user[key] = value;
      await user.save();
      return successResponse("User updated successfully");
    } else {
      const res = await verifyOtp(user, otp);
      if (res.isVerified) {
        user[key] = value;
        await user.save();
        return successResponse("User updated successfully");
      } else {
        return errorResponse(res.message);
      }
    }
  } catch (error) {
    logger.error("Some Error Occured in POST /user -- " + error);
    return internalServerErrorResponse(
      "An error occurred while processing your request.",
      error
    );
  }
}

// todo verify otp and save the data and add validations. + verify working of this + otp verification.
//req to update user password or for forgot password.
export async function PUT(req) {
  try {
    const body = await req.json();
    const { error } = passwordChangeSchema.validate(body);
    if (error) {
      logger.error(
        "Error in POST /user -- " + error.details[0].message + " -- " + error
      );
      return badRequestResponse(error.details[0].message, error);
    }
    const { passowrd, oldPassword, otp } = body;
    const id = JSON.parse(req.headers.get("X-Custom-Data") || "{}").userId;
    if (!id) {
      return badRequestResponse("Id not found");
    }
    const user = await User.findById(id);
    if (oldPassword != null && oldPassword != "") {
      if (await user.comparePassword(oldPassword)) {
        user.passowrd = passowrd;
        await user.save();
      } else {
        return unauthorizedResponse("Incorrect old password. Try again");
      }
    } else {
      const res = await verifyOtp(user, otp);
      if (res.isVerified) {
        user.password = passowrd;
        await user.save();
        return successResponse("User updated successfully");
      } else {
        return errorResponse(res.message);
      }
    }
    return successResponse("Password updated successfully");
  } catch (error) {
    logger.error("Some Error Occured in PUT /user -- " + error);
    return internalServerErrorResponse(
      "An error occurred while processing your request.",
      error
    );
  }
}

// todo can be deleted with some validations and after some duration
//req to submit the user delete request.
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { otp } = body;
    const id = JSON.parse(req.headers.get("X-Custom-Data") || "{}").userId;
    if (!id) {
      return badRequestResponse("Id not found or may be already deleted.");
    }
    const user = await User.findById(id);
    if (user.isDeleted) {
      return badRequestResponse("Already processing your delete request.");
    }
    const res = await verifyOtp(user, otp);
    if (res.isVerified) {
      user.isDeleted = true;
      user.deleteRequestDate = new Date();
      await user.save();
      return successResponse("Delete request submitted.");
    } else {
      return errorResponse(res.message);
    }
  } catch (error) {
    logger.error("Some Error Occured in DELETE /user -- " + error);
    return internalServerErrorResponse(
      "An error occurred while processing your request.",
      error
    );
  }
}
