import {NextFunction, Request, Response} from "express";
import {
	RegisterReqBody,
	LoginReqBody,
	AuthResBody,
	LogoutResBody,
	AuthReqCookies
} from "./auth.types";
import AuthService from "./auth.service";

class AuthController {
	static async register(
		req: Request<{}, AuthResBody, RegisterReqBody, {}>,
		res: Response<AuthResBody>,
		next: NextFunction
	) {
		try {
			const {email, password, username} = req.body;
			const user = await AuthService.register({email, password, username});

			res.cookie("refreshToken", user.tokens.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true
			});
			res.status(201).json(user);
		} catch (e) {
			next(e);
		}
	}

	static async login(
		req: Request<{}, AuthResBody, LoginReqBody, {}>,
		res: Response<AuthResBody>,
		next: NextFunction
	) {
		try {
			const {password, username} = req.body;
			const user = await AuthService.login({password, username});

			res.cookie("refreshToken", user.tokens.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true
			});
			res.json(user);
		} catch (e) {
			next(e);
		}
	}

	static async logout(
		req: Request<{}, LogoutResBody, {}, {}>,
		res: Response<LogoutResBody>,
		next: NextFunction
	) {
		try {
			const {refreshToken} = req.cookies as AuthReqCookies;
			await AuthService.logout(refreshToken);
			res.clearCookie("refreshToken");
			res.json({message: "Logout successful."});
		} catch (e) {
			next(e);
		}
	}

	static async refresh(
		req: Request<{}, AuthResBody, {}, {}>,
		res: Response<AuthResBody>,
		next: NextFunction
	) {
		try {
			const {refreshToken} = req.cookies as AuthReqCookies;
			const user = await AuthService.refresh(refreshToken);
			res.cookie("refreshToken", user.tokens.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true
			});
			res.json(user);
		} catch (e) {
			next(e);
		}
	}
}

export default AuthController;
