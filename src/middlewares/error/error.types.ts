import {ValidationError} from "express-validator";

interface ErrorResBody {
	message: string;
	validationErrors?: ValidationError[];
}

export type {ErrorResBody};
