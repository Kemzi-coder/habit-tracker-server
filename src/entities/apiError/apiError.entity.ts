import {ValidationError} from "express-validator";
import {ApiErrorProps} from "./apiError.types";

class ApiError extends Error implements ApiErrorProps {
	status;

	validationErrors;

	constructor(
		message: string,
		status: number,
		validationErrors?: ValidationError[]
	) {
		super(message);
		this.status = status;
		this.validationErrors = validationErrors;
	}

	static getUnathorized(
		message: string = "Unauthorized. Access denied."
	): ApiError {
		return new ApiError(message, 401);
	}

	static getBadRequest(message: string = "Bad request."): ApiError {
		return new ApiError(message, 400);
	}

	static getValidationError(
		errors: ValidationError[],
		message: string = "Validation error."
	): ApiError {
		return new ApiError(message, 400, errors);
	}
}

export default ApiError;
