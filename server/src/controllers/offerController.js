import {
    getMyOffer,
    respondToOffer,
    expireOffers,
} from "../services/offerService.js";

export const getMyOfferController = async (req, res, next) => {
    try {
        const result = await getMyOffer(req.user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const respondToOfferController = async (req, res, next) => {
    try {
        const result = await respondToOffer(
            req.user.id,
            req.body.decision
        );

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export const expireOffersController = async (req, res, next) => {
    try {
        const result = await expireOffers();

        res.status(200).json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};