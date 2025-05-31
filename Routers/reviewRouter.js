import express from "express";

import reviewController from "../Controllers/reviewCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/review",  reviewController.createReview);
router.get("/getallReview", reviewController.getallReview);
router.get("/getReviewById/:id", reviewController.getReviewById);
router.get("/getReviewDetails", reviewController.getReviewDetails);
router.get('/getDashboard', reviewController.getDashboard);
router.get('/getCompanyDashboard', reviewController.getCompanyDashboard);

export default router;