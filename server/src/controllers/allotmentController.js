import { runPreview } from "../services/allotmentService.js";
import { publishAllotment } from "../services/publishService.js";

const previewAllotment = async (req, res, next) => {
    try {
        const rows = await runPreview();

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        next(error);
    }
};

const publishAllotmentController = async (req, res, next) => {
    try {
        const result = await publishAllotment(req.user.id);

        res.status(200).json({
            success: true,
            message: "Allotment published successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export { previewAllotment, publishAllotmentController };