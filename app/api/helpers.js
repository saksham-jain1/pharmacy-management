export const verifyOtp = async (user, OTP) => {
  if (
    user.verificationTime &&
    new Date().getTime() - new Date(user.verificationTime).getTime() >
      30 * 60 * 1000
  ) {
    user.verificationAttempt = 0;
  }

  if (user.verificationAttempt >= 3) {
    return {
      message: `Maximum Attempt exceded. Please try after ${
        30 -
        Math.ceil(
          (new Date().getTime() - new Date(user.verificationTime).getTime()) /
            60000
        )
      } minutes.`,
      isVerified: false,
    };
  }
  if (
    user.otp == OTP &&
    new Date().getTime() - new Date(user.otpSendTime).getTime() < 10 * 60 * 1000
  ) {
    user.verificationAttempt = 0;
    user.otpAttempt = 0;
    await user.save();
    return { message: "OTP verified successfully.", isVerified: true };
  } else {
    if (user.verificationAttempt) user.verificationAttempt += 1;
    else user.verificationAttempt = 1;
    if (user.verificationAttempt == 1) user.verificationTime = Date.now();
    await user.save();
    return {
      message:
        "Invalid code " +
        (user.verificationAttempt
          ? `Only ${3 - user.verificationAttempt} left.`
          : "Please try again after 30 min."),
      isVerified: false,
    };
  }
};
