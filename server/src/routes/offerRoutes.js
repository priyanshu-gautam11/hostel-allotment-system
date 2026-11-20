import { Router } from "express";

import {
    getMyOfferController,
    respondToOfferController,
    expireOffersController,
} from "../controllers/offerController.js";

import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

const router = Router();

// Student routes
router.get(
    "/me",
    auth,
    requireRole("student"),
    getMyOfferController
);

router.post(
    "/me/respond",
    auth,
    requireRole("student"),
    respondToOfferController
);

// Admin route
router.post(
    "/admin/expire-sweep",
    auth,
    requireRole("admin"),
    expireOffersController
);

export default router;