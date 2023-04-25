import {Router} from "express";
import {authRoutes} from "../app/auth";
import {userRoutes} from "../app/user";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
