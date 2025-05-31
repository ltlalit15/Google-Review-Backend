import express from "express";

import bannerController from "../Controllers/bannerCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/banner",  bannerController.createBanner);
router.get("/banner/:user_id", bannerController.getByBanner);
router.get("/getBannerDetails", bannerController.getBannerDetails);

// router.post("/business", QRCodeontroller.createBusiness);
// router.put("/qr-code/:id", authMiddleware, QRCodeontroller.editQRCode);
// router.delete("/qr-code/:id", authMiddleware, QRCodeontroller.deleteQRCode);

export default router;  