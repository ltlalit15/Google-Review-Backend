import express from "express";

import AIController from "../Controllers/AiCtrl.js";

const router = express.Router();

router.post("/chat",  AIController.sendFeedback);

export default router;  