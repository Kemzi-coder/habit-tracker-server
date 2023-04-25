import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {ApiError} from "../../entities/apiError";

const validationMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return next(ApiError.getValidationError(errors.array()));
	}

	return next();
};

export default validationMiddleware;
