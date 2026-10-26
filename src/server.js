import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler.js";
import { userRoutes } from "./routes/user.route.js";
import { categoryRoutes } from "./routes/category.route.js";
import { transactionRoutes } from "./routes/transaction.route.js";
import { budgetRoutes } from "./routes/budget.route.js";
import { dashboardRoutes } from "./routes/dashboard.route.js";
import { reportRoutes } from "./routes/report.route.js";
import { sendSuccess } from "./utils/apiResponse.js";

const app = express();
const port = process.env.PORT || 8080;
const corsOptions = {
  origin: [process.env.CLIENT_URL],
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// Error handling middleware
app.use(errorHandler);

app.get("/healthCheck", (req, res) => {
  sendSuccess(res, 200, "Server is healthy");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
