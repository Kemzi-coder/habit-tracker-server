import {NextFunction, Request, Response} from "express";
import ApiError from "../../entities/apiError/apiError.entity";
import {ErrorResBody} from "./error.types";

const errorMiddleware = (
	err: Error | ApiError,
	req: Request<unknown, unknown, unknown, unknown>,
	res: Response<ErrorResBody>,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: NextFunction
) => {
	let status = 500;
	const error: ErrorResBody = {message: "Something went wrong."};

	if (err instanceof ApiError) {
		status = err.status;
		error.message = err.message;
		error.validationErrors = err.validationErrors;
	}

	console.log(err);
	res.status(status).json(error);
};

export default errorMiddleware;
