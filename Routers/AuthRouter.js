import express from "express";

import UserController from "../Controllers/AuthCtrl.js";
import { authMiddleware } from "../Middlewares/Auth.js";

const router = express.Router();

router.get("/users", UserController.getallUser);
router.get("/getAllGroup", UserController.getAllGroup);
router.post("/updateStatus/:id", UserController.updateStatus);
router.post("/signup", UserController.createUser);
router.post("/signInWithGoogle", UserController.signInWithGoogle);
router.get("/getUserById/:id", UserController.getUserById);
router.post("/login", UserController.loginUser);
router.put("/edituser/:id", UserController.editUser);
router.delete("/deleteuser/:id", UserController.deleteUser);

export default router;
