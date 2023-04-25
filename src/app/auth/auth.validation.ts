import {body} from "express-validator";

const usernameValidation = body("username")
	.exists()
	.withMessage("Username is not specified.")
	.isString()
	.withMessage("Username must be a string.")
	.notEmpty()
	.withMessage("Username must not be empty.")
	.isLength({min: 5, max: 14})
	.withMessage("Username must contain from 5 to 14 characters.");

const passwordValidation = body("password")
	.exists()
	.withMessage("Password is not specified.")
	.isString()
	.withMessage("Password must be a string.")
	.notEmpty()
	.withMessage("Password must not be empty.")
	.isLength({min: 6, max: 28})
	.withMessage("Password must contain from 6 to 28 characters.")
	.matches(/[a-z]/)
	.withMessage("Password must contain at least one lowercase letter.")
	.matches(/[A-Z]/)
	.withMessage("Password must contain at least one uppercase letter.")
	.matches(/[0-9]/)
	.withMessage("Password must contain at least one number.");

const emailValidation = body("email")
	.exists()
	.withMessage("Email is not specified.")
	.isString()
	.withMessage("Email must be a string.")
	.notEmpty()
	.withMessage("Email must not be empty.")
	.isEmail()
	.withMessage("Email is invalid.");

const registerValidation = [
	usernameValidation,
	emailValidation,
	passwordValidation
];

const loginValidation = [usernameValidation, passwordValidation];

export {registerValidation, loginValidation};
