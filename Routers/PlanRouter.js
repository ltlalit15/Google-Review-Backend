import express from "express";

import PlanController from "../Controllers/PlanCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.get("/plan", PlanController.getallPlan);
router.post("/plan", PlanController.createPlan);
router.get("/getPlanById/:id", PlanController.getPlanById);
router.put("/plan/:id", PlanController.editPlan);
router.delete("/plan/:id", PlanController.deletePlan);

export default router;
