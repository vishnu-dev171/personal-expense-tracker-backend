import express from "express";
import { validateData } from "../middlewares/validateData.js";
import {
  updateProfileSchema,
  userLoginSchema,
  userRegisterSchema,
} from "../schemas/user.schema.js";
import * as userController from "../controllers/user.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const {
  registerUser,
  loginUser,
  logoutUser,
  userProfile,
  refreshAccessToken,
  updateProfile,
} = userController;
const router = express.Router();

router.post("/register", validateData(userRegisterSchema), registerUser);
router.post("/login", validateData(userLoginSchema), loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/profile", authenticateToken, userProfile);
router.patch(
  "/updateProfile",
  authenticateToken,
  validateData(updateProfileSchema),
  updateProfile,
);

export { router as userRoutes };
