import { Router } from "express";
import { getReports } from "../controllers/report.controller.js";
import authenticateToken from "../middlewares/authenticateToken.js";
import { getReportSchema } from "../schemas/report.schema.js";
import { validateData } from "../middlewares/validateData.js";

const router = Router();

router.get("/", authenticateToken, validateData(getReportSchema), getReports);

export { router as reportRoutes };
