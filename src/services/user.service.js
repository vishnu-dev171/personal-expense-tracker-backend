import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";

export const register = async ({ name, email, password }) => {
  // Check existence via repository
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Save new user via repository
  const newUser = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
  });

  return {
    user: {
      id: newUser.userId,
      name: newUser.name,
    },
  };
};

export const login = async ({ email, password }) => {
  // Check existence via repository
  const existingUser = await userRepository.findUserByEmail(email);
  if (!existingUser) {
    throw new AppError("Invalid email or password", 401);
  }

  // check user account is active
  if (existingUser.status && existingUser.status !== "ACTIVE") {
    throw new AppError("User account is not active", 401);
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate token
  const token = jwt.sign(
    {
      id: existingUser.userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  return {
    token,
    user: {
      id: existingUser.userId,
      name: existingUser.name,
    },
  };
};

export const profile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};
