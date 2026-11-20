import { releaseBed } from "../services/vacancyService.js";

export const releaseBedController = async (req, res, next) => {
    try {
        const result = await releaseBed(
            req.user.id,
            req.params.bedId
        );

        res.status(200).json({
            success: true,
            message: "Bed released successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};