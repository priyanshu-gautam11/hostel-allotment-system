import express from "express";
import cors from "cors";
import helmet from "helmet";

// Configuration
import { env } from "./config/env.js";

// Routes
import hostelRoutes from "./routes/hostelRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bedRoutes from "./routes/bedRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import vacancyRoutes from "./routes/vacancyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Middleware
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Security and common middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/admin/vacancies", vacancyRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", hostelRoutes);
app.use("/api", bedRoutes);
app.use("/api", applicationRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;