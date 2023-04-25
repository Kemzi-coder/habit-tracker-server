import {Router} from "express";
import AuthController from "./auth.controller";
import {validationMiddleware} from "../../middlewares/validation";
import {registerValidation, loginValidation} from "./auth.validation";

const authRoutes = Router();

authRoutes.post(
	"/register",
	registerValidation,
	validationMiddleware,
	AuthController.register
);
authRoutes.post(
	"/login",
	loginValidation,
	validationMiddleware,
	AuthController.login
);
authRoutes.post("/logout", AuthController.logout);
authRoutes.post("/refresh", AuthController.refresh);

export default authRoutes;
