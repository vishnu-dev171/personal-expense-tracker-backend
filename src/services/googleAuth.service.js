import googleClient from "../config/googleAuth.js";
import prisma from "../config/prismaClient.js";
import AppError from "../utils/AppError.js";
import * as userService from "./user.service.js";

export const googleLogin = async (credential) => {
  // 1. Verify Google ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new AppError("Invalid Google account", 401);
  }

  if (!payload.email_verified) {
    throw new AppError("Google email is not verified", 401);
  }

  const { sub: googleId, email, name } = payload;

  // 2. Find existing Google account
  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  if (!user) {
    // 3. Check whether this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Only automatically link when Google is
      // authoritative for the email (Gmail or Workspace).
      const isGmail = email.toLowerCase().endsWith("@gmail.com");
      const isWorkspace = Boolean(payload.hd);

      if (!isGmail && !isWorkspace) {
        throw new AppError(
          "Please login with your existing account first and link Google from settings",
          409,
        );
      }

      if (existingUser.status !== "ACTIVE") {
        throw new AppError("Account is inactive", 403);
      }

      user = await prisma.user.update({
        where: { userId: existingUser.userId },
        data: { googleId },
      });
    } else {
      // 4. Create a new Google user
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email: email.toLowerCase(),
          googleId,
          password: null,
        },
      });
    }
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Account is inactive", 403);
  }

  // 5. Reuse your existing JWT authentication logic
  return await userService.createUserSession(user);
};
