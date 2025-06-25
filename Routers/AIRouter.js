import express from "express";

import AIController from "../Controllers/AiCtrl.js";

const router = express.Router();

router.post("/chat",  AIController.sendFeedback);
router.get("/dashboard",  AIController.dashboard);
router.get("/usersreview",  AIController.review);

export default router;  