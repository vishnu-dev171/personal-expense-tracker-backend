import * as userService from "../services/user.service.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge:
    Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000,
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", {
    ...accessCookieOptions,
    maxAge: undefined,
  });

  res.clearCookie("refreshToken", {
    ...refreshCookieOptions,
    maxAge: undefined,
  });
};

export const registerUser = async (req, res, next) => {
  try {
    const result = await userService.register(req.validated.body);

    res.status(201).json({
      message: "User registered successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const result = await userService.login(req.validated.body);

    res.cookie("accessToken", result.accessToken, accessCookieOptions);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "User logged in successfully",
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      sendError(res, 401, "Refresh token is required");
    }

    const result = await userService.refresh(token);

    res.cookie("accessToken", result.accessToken, accessCookieOptions);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    res.status(200).json({
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    await userService.logout(req.cookies?.refreshToken);

    clearAuthCookies(res);

    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const userProfile = async (req, res, next) => {
  try {
    const user = await userService.profile(req.user.id);

    res.status(200).json({ authenticated: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const body = req.validated.body;
  try {
    const result = await userService.update(body, userId);
    sendSuccess(res, 200, "profile updated successfully", result);
  } catch (error) {
    next(error);
  }
};
