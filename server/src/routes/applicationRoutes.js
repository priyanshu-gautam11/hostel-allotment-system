import express from "express";


import auth from "../middleware/auth.js";
import requireRole from "../middleware/requireRole.js";
import validate from "../middleware/validate.js";

import upload from "../config/upload.js";
import {
  previewAllotment,
  publishAllotmentController,
} from "../controllers/allotmentController.js";

import {
    applicationSchema,
    verifyApplicationSchema,
} from "../validators/applicationValidator.js";

import {
    submitApplication,
    getMyApplication,
    listApplications,
    verifyApplication,
    rejectApplication,
    getMarksheet,
} from "../controllers/applicationController.js";

const router = express.Router();

// STUDENT ROUTES

router.post(
    "/applications",
    auth,
    requireRole("student"),
    upload.single("marksheet"),
    validate(applicationSchema),
    submitApplication
);

router.get(
    "/applications/me",
    auth,
    requireRole("student"),
    getMyApplication
);

router.get(
    "/applications/:id/marksheet",
    auth,
    getMarksheet
);

// ADMIN ROUTES

router.get(
    "/admin/applications",
    auth,
    requireRole("admin"),
    listApplications
);

router.patch(
    "/admin/applications/:id/verify",
    auth,
    requireRole("admin"),
    validate(verifyApplicationSchema),
    verifyApplication
);

router.patch(
    "/admin/applications/:id/reject",
    auth,
    requireRole("admin"),
    rejectApplication
);
router.get(
  "/admin/allotment/preview",
  auth,
  requireRole("admin"),
  previewAllotment
);

router.post(
  "/admin/allotment/publish",
  auth,
  requireRole("admin"),
  publishAllotmentController
);

export default router;