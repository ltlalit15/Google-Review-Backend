import express from "express";

import enquiryController from "../Controllers/enquiryCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/enquiry", enquiryController.createEnquiry);
router.get("/enquiry", enquiryController.getAllEnquiry);
// router.put("/plan/:id", authMiddleware, PlanController.editPlan);
// router.put("/plan/:id", authMiddleware, PlanController.editPlan);
// router.delete("/plan/:id", authMiddleware, PlanController.deletePlan);

export default router;
