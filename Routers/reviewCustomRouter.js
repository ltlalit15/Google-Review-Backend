import express from "express";

import ReviewCustomizationController from "../Controllers/reviewCustomCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/reviewCustom",  ReviewCustomizationController.addReviewCustomization);
router.get("/getallReviewCustom", ReviewCustomizationController.getallReviewCustom);
router.patch("/editReviewCustomization/:id", ReviewCustomizationController.editReviewCustomization);
// router.get("/getReviewDetails", reviewController.getReviewDetails);




export default router;