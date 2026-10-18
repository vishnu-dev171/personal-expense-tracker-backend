import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import { userRoutes } from "./routes/user.route.js";
import { categoryRoutes } from "./routes/category.route.js";
import { transactionRoutes } from "./routes/transaction.route.js";
import { budgetRoutes } from "./routes/budget.route.js";
import { dashboardRoutes } from "./routes/dashboard.route.js";
import { reportRoutes } from "./routes/report.route.js";

const app = express();
const port = process.env.PORT || 8080;
const corsOptions = {
  origin: [process.env.CLIENT_URL],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
