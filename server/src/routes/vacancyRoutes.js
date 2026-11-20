import { Router } from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";
import { releaseBedController } from "../controllers/vacancyController.js";

const router = Router();

router.post(
    "/:bedId/release",
    auth,
    requireRole("admin"),
    releaseBedController
);

export default router;