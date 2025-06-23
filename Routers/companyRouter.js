import express from "express";

import companyController from "../Controllers/companyCtrl.js";

const router = express.Router();

router.post("/company",  companyController.createCompany);
router.get("/getallCompany", companyController.getallCompany);
router.get("/getCompanyById/:id", companyController.getCompanyById);
router.put("/editCompany/:id", companyController.editCompany);
// router.post("/business", QRCodeontroller.createBusiness);
// router.put("/qr-code/:id", authMiddleware, QRCodeontroller.editQRCode);
router.delete("/deleteCompany/:id", companyController.deleteCompany);
router.post("/updateCompanyStatus/:id", companyController.updateCompanyStatus);

router.get("/getCompanyDetails", companyController.getCompanyDetails);
router.get("/getCompanyDetailsforSentimentAnalytics", companyController.getCompanyDetailsforSentimentAnalytics);
// router.get("/getCompanyHeadlineDetails", companyController.getCompanyHeadlineDetails);
// router.get("/getReviewHeadline", companyController.getReviewHeadline);
router.get("/getCompanyDetailsForReviewMangement", companyController.getCompanyDetailsForReviewMangement);

export default router;  