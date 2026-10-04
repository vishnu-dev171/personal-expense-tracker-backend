import * as userService from "../services/user.service.js";

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
    const { token, user } = result;

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // Expires in 1hr
    });

    res.status(200).json({
      message: "User logged in successfully",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

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
