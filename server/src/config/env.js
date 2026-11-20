import "dotenv/config";

export const env = {
    PORT: Number(process.env.PORT) || 5000,
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hostel_allotment",
    JWT_SECRET: process.env.JWT_SECRET || "fallback_super_secret_jwt_key_2026",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    OFFER_WINDOW_HOURS: Number(process.env.OFFER_WINDOW_HOURS) || 48,
};
