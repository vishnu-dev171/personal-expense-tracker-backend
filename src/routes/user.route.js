import express from "express";
import { validateData } from "../middlewares/validateData.js";
import { userLoginSchema, userRegisterSchema } from "../schemas/user.schema.js";
import * as userController from "../controllers/user.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const { registerUser, loginUser, logoutUser, userProfile } = userController;
const router = express.Router();

router.post("/register", validateData(userRegisterSchema), registerUser);
router.post("/login", validateData(userLoginSchema), loginUser);
router.post("/logout", authenticateToken, logoutUser);
router.get("/profile", authenticateToken, userProfile);

export { router as userRoutes };
