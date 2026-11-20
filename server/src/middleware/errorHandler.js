import multer from "multer";
import { env } from "../config/env.js";

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;

    if (err instanceof multer.MulterError) {
        statusCode = 400;

        if (err.code === "LIMIT_FILE_SIZE") {
            message = "File size cannot exceed 2 MB.";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "Unexpected file field. Use 'marksheet'.";
        } else {
            message = "File upload failed.";
        }
    }

    if (statusCode === 500 && env.NODE_ENV === "production") {
        message = "Something went wrong on the server.";
    }

    console.error(err);

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

export default errorHandler;