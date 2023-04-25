import {Router} from "express";
import authMiddleware from "../../middlewares/auth/auth.middleware";
import UserController from "./user.controller";

const userRoutes = Router();

userRoutes.get("/", authMiddleware, UserController.getAll);

export default userRoutes;
