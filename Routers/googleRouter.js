import express from "express";


import googleController from "../Controllers/googleCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";
const router = express.Router();

// Add your middleware if needed (e.g., authMiddleware)

router.get("/reviews/:place", googleController.getPlaceReviews);
router.get("/rating/:place", googleController.getRatingOnly);
router.get("/placeid/:place", googleController.getPlaceIdOnly);
router.get("/url/:place", googleController.getPlaceUrlOnly);
router.get("/reviewlink/:place", googleController.getReviewLink);


export default router;
