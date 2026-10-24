import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository.js";
import * as refreshTokenRepository from "../repositories/refreshToken.repository.js";
import AppError from "../utils/AppError.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";

const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

const createAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
};

const createRefreshSession = async (userId) => {
  const refreshToken = generateRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );

  await refreshTokenRepository.create(
    userId,
    hashRefreshToken(refreshToken),
    expiresAt,
  );

  return refreshToken;
};

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
  const existingUser = await userRepository.findUserByEmail(email);

  if (!existingUser) {
    throw new AppError("Invalid email or password", 401);
  }

  if (existingUser.status !== "ACTIVE") {
    throw new AppError("User account is not active", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = createAccessToken(existingUser.userId);
  const refreshToken = await createRefreshSession(existingUser.userId);

  return {
    accessToken,
    refreshToken,
    user: {
      id: existingUser.userId,
      name: existingUser.name,
    },
  };
};

export const refresh = async (rawToken) => {
  const tokenHash = hashRefreshToken(rawToken);
  const session = await refreshTokenRepository.findByHash(tokenHash);

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.user.status !== "ACTIVE"
  ) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const newRefreshToken = generateRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );

  const rotated = await refreshTokenRepository.rotate({
    oldTokenId: session.refreshTokenId,
    userId: session.userId,
    tokenHash: hashRefreshToken(newRefreshToken),
    expiresAt,
  });

  if (!rotated) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  return {
    accessToken: createAccessToken(session.userId),
    refreshToken: newRefreshToken,
  };
};

export const logout = async (rawToken) => {
  if (!rawToken) return;

  await refreshTokenRepository.revokeByHash(hashRefreshToken(rawToken));
};

export const profile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.status !== "ACTIVE") {
    throw new AppError("User account is not active", 401);
  }
  return user;
};

export const update = async (data, userId) => {
  const { email } = data;
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const userByEmail = await userRepository.findUserByEmail(email);
  if (userByEmail && userByEmail.userId !== user.userId) {
    throw new AppError("Email already exists", 400);
  }
  return await userRepository.update(data, userId);
};
