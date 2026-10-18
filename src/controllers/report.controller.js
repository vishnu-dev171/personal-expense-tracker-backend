import * as reportService from "../services/report.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type, categoryId } = req.validated.query;

    const dashboard = await reportService.getReports({
      userId,
      startDate,
      endDate,
      type,
      categoryId,
    });

    sendSuccess(res, 200, "Reports retrieved successfully", dashboard);
  } catch (error) {
    next(error);
  }
};
