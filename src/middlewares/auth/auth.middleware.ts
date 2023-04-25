import {NextFunction, Request, Response} from "express";
import {TokenService} from "../../app/token";
import ApiError from "../../entities/apiError/apiError.entity";
import {UserReqObject} from "./auth.types";

const authMiddleware = (
	req: Request<unknown, unknown, unknown & UserReqObject, unknown>,
	res: Response<unknown>,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			return next(ApiError.getUnathorized());
		}

		const accessToken = authHeader.split(" ")[1];

		if (!accessToken) {
			return next(ApiError.getUnathorized());
		}

		const userData = TokenService.validateAccessToken(accessToken);

		if (!userData) {
			return next(ApiError.getUnathorized());
		}

		req.body = {...req.body, ...userData};

		return next();
	} catch (e) {
		console.log(e);
		return next(ApiError.getUnathorized());
	}
};

export default authMiddleware;
