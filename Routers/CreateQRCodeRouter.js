import express from "express";

import QRCodeontroller from "../Controllers/CreateQRCodeCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

//router.get("/qr-code", QRCodeontroller.getallQRCode);
router.post("/qr-code",  QRCodeontroller.createQRCode);
router.get("/qr-codebyId/:user_id", QRCodeontroller.getByQrcode);
router.post("/business", QRCodeontroller.createBusiness);
router.put("/qr-code/:id", QRCodeontroller.editQRCode);
router.delete("/qr-code/:id", QRCodeontroller.deleteQRCode);

export default router;  
