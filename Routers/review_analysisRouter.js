import express from "express";

import review_analysisController from "../Controllers/review_analysisCtrl.js";

const router = express.Router();

router.post("/review_analysis",  review_analysisController.createReviewAnalysis);
router.post("/create_review_servey",  review_analysisController.createreview_servay);
router.get("/review_analysis", review_analysisController.getCurrentMonthReviewAnalysis);
router.get("/get_review_servey", review_analysisController.getreview_servay);


export default router;