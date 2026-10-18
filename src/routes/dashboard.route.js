import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";

const router = Router();

router.get("/", authenticateToken, getDashboard);

export { router as dashboardRoutes };
