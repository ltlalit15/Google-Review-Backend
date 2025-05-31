import express from "express";

import companyController from "../Controllers/companyCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.post("/company",  companyController.createCompany);
router.get("/getallCompany", companyController.getallCompany);
router.get("/getCompanyById/:id", companyController.getCompanyById);
// router.post("/business", QRCodeontroller.createBusiness);
// router.put("/qr-code/:id", authMiddleware, QRCodeontroller.editQRCode);
router.delete("/deleteCompany/:id", companyController.deleteCompany);
router.post("/updateCompanyStatus/:id", companyController.updateCompanyStatus);

router.get("/getCompanyDetails", companyController.getCompanyDetails);
router.get("/getCompanyDetailsforSentimentAnalytics", companyController.getCompanyDetailsforSentimentAnalytics);
// router.get("/getCompanyHeadlineDetails", companyController.getCompanyHeadlineDetails);
// router.get("/getReviewHeadline", companyController.getReviewHeadline);


export default router;  