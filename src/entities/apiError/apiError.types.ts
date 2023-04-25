import {ValidationError} from "express-validator";

interface ApiErrorProps {
	status: number;
	validationErrors?: ValidationError[];
}

export type {ApiErrorProps};
