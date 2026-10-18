import * as dashboardService from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const dashboard = await dashboardService.getDashboard(userId);

    sendSuccess(res, 200, "Dashboard retrieved successfully", dashboard);
  } catch (error) {
    next(error);
  }
};
