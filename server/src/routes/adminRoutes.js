import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";

import {
    getAdminStats,
    getOccupiedBeds,
    getWaitlist,
    promoteWaitlistEntry,
    getAuditLogs,
} from "../controllers/adminController.js";

const router = express.Router();

// Require admin authentication for all admin routes
router.use(auth, requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/vacancies", getOccupiedBeds);
router.get("/vacancies/occupied", getOccupiedBeds);
router.get("/waitlist", getWaitlist);
router.post("/waitlist/:id/promote", promoteWaitlistEntry);
router.get("/audit-logs", getAuditLogs);

export default router;
