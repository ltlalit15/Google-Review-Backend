import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";
import PlanRouter from "./Routers/PlanRouter.js";
import CreateQRCodeRouter from "./Routers/CreateQRCodeRouter.js";
import createEnquiry from "./Routers/enquiryRouter.js";
import createBanner from "./Routers/bannerRouter.js";
import createCompany from "./Routers/companyRouter.js";
import googleRouter from "./Routers/googleRouter.js";
import reviewRouter from "./Routers/reviewRouter.js";
import reviewCustomRouter from "./Routers/reviewCustomRouter.js";
import review_analysisRouter from "./Routers/review_analysisRouter.js";
//import businessRouter from "./Routers/businessRouter.js";


const router = Router();

router.use("/api", AuthRouter);
router.use("/api", PlanRouter);
router.use("/api", CreateQRCodeRouter);
router.use("/api", createEnquiry);
router.use("/api", createBanner);
router.use("/api", createCompany);
router.use("/api", googleRouter);
router.use("/api", reviewRouter);
router.use("/api", reviewCustomRouter);
router.use("/api", review_analysisRouter);
//router.use("/api", businessRouter);


export default router;
