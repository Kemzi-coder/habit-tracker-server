import request from "supertest";
import pg from "pg";
import app, {server} from "../../../src";
import {ValidationError} from "express-validator";

const {Pool} = pg;
let pool: pg.Pool;

const getValidError = ({
	msg,
	path
}: {
	msg: string;
	path: string;
}): ValidationError => {
	const obj: ValidationError = {
		type: "field",
		msg,
		path,
		location: "body",
		value: undefined
	};

	return obj;
};

// Before all tests
beforeAll(async () => {
	// Connect to the test database
	pool = new Pool({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_TEST_DATABASE,
		port: 5432
	});
	// Delete all tokens
	await pool.query("DELETE FROM tokens;");
	// Delete all users
	await pool.query("DELETE FROM users;");
});

// After each test
afterEach(async () => {
	// Delete all tokens
	await pool.query("DELETE FROM tokens;");
	// Delete all users
	await pool.query("DELETE FROM users;");
	// Stop the server
	await server.close();
});

// After all tests
afterAll(async () => {
	// End database connection
	pool.end();
});

describe("POST /api/login and POST /api/register validation", () => {
	beforeEach(async () => {
		// Delete all tokens
		await pool.query("DELETE FROM tokens;");
		// Delete all users
		await pool.query("DELETE FROM users;");
	});

	const errMsg = "Validation error.";
	const errMsgProp = "message";
	const errsProp = "validationErrors";

	const validValues = {
		username: "username",
		password: "Password1",
		email: "email@gmail.com"
	};

	const validationErrors = {
		username: {
			exists: getValidError({
				path: "username",
				msg: "Username is not specified."
			}),
			isString: getValidError({
				path: "username",
				msg: "Username must be a string."
			}),
			notEmpty: getValidError({
				path: "username",
				msg: "Username must not be empty."
			}),
			isLength: getValidError({
				path: "username",
				msg: "Username must contain from 5 to 14 characters."
			})
		},
		password: {
			exists: getValidError({
				path: "password",
				msg: "Password is not specified."
			}),
			isString: getValidError({
				path: "password",
				msg: "Password must be a string."
			}),
			notEmpty: getValidError({
				path: "password",
				msg: "Password must not be empty."
			}),
			isLength: getValidError({
				path: "password",
				msg: "Password must contain from 6 to 28 characters."
			}),
			hasLowercase: getValidError({
				path: "password",
				msg: "Password must contain at least one lowercase letter."
			}),
			hasUppercase: getValidError({
				path: "password",
				msg: "Password must contain at least one uppercase letter."
			}),
			hasNumber: getValidError({
				path: "password",
				msg: "Password must contain at least one number."
			})
		},
		email: {
			exists: getValidError({
				path: "email",
				msg: "Email is not specified."
			}),
			isString: getValidError({
				path: "email",
				msg: "Email must be a string."
			}),
			notEmpty: getValidError({
				path: "email",
				msg: "Email must not be empty."
			}),
			isEmail: getValidError({
				path: "email",
				msg: "Email is invalid."
			})
		}
	};

	test("should be successful", async () => {
		const registerBody = {...validValues};
		const loginBody = {
			username: validValues.username,
			password: validValues.password
		};

		const registerResponse = await request(app)
			.post("/api/auth/register")
			.send(registerBody);
		const loginResponse = await request(app)
			.post("/api/auth/login")
			.send(loginBody);

		const statuses = [registerResponse.status, loginResponse.status];
		const types = [registerResponse.type, loginResponse.type];

		expect(statuses).toEqual([201, 200]);
		expect(types.every(i => i === "application/json")).toBe(true);
	});

	describe("validation of the password field", () => {
		test("valid password, should be successful", async () => {
			const password = "Password1";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			expect(statuses).toEqual([201, 200]);
			expect(types.every(i => i === "application/json")).toBe(true);
		});

		test("password without uppercase letter", async () => {
			const password = "password1";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.hasUppercase,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("password without lowercase letter", async () => {
			const password = "PASSWORD1";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.hasLowercase,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("password without a number", async () => {
			const password = "Password";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.hasNumber,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("too short password", async () => {
			// 5 characters
			const password = "Pass1";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.isLength,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("too long password", async () => {
			// 29 characters
			const password = "Passpasspasspasspasspasspass1";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.isLength,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("password is not a string", async () => {
			const password = 5;

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.isString,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("password is empty", async () => {
			const password = "";

			const registerBody = {...validValues, password};
			const loginBody = {username: validValues.username, password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.password.notEmpty,
				value: password
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("password doesn't exist", async () => {
			const registerBody = {
				username: validValues.username,
				email: validValues.email
			};
			const loginBody = {username: validValues.username};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = validationErrors.password.exists;

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});
	});

	describe("validation of the username field", () => {
		test("valid username, should be successful", async () => {
			const username = "username";

			const registerBody = {...validValues, username};
			const loginBody = {password: validValues.password, username};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			expect(statuses).toEqual([201, 200]);
			expect(types.every(i => i === "application/json")).toBe(true);
		});

		test("username is too short", async () => {
			// 4 characters
			const username = "user";

			const registerBody = {...validValues, username};
			const loginBody = {password: validValues.password, username};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.username.isLength,
				value: username
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("username is too long", async () => {
			// 15 characters
			const username = "usernameusernam";

			const registerBody = {...validValues, username};
			const loginBody = {password: validValues.password, username};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.username.isLength,
				value: username
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("username is empty", async () => {
			const username = "";

			const registerBody = {...validValues, username};
			const loginBody = {password: validValues.password, username};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.username.notEmpty,
				value: username
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("username is not a string", async () => {
			const username = true;

			const registerBody = {...validValues, username};
			const loginBody = {password: validValues.password, username};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = {
				...validationErrors.username.isString,
				value: username
			};

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("username doesn't exist", async () => {
			const registerBody = {
				password: validValues.password,
				email: validValues.email
			};
			const loginBody = {password: validValues.password};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);
			const loginResponse = await request(app)
				.post("/api/auth/login")
				.send(loginBody);

			const statuses = [registerResponse.status, loginResponse.status];
			const types = [registerResponse.type, loginResponse.type];

			const expectedError = validationErrors.username.exists;

			expect(statuses.every(i => i === 400)).toBe(true);
			expect(types.every(i => i === "application/json")).toBe(true);
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(loginResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
			expect(loginResponse.body).toHaveProperty(errsProp);
			expect(loginResponse.body[errsProp]).toContainEqual(expectedError);
		});
	});

	describe("validation of the email field", () => {
		test("valid email, should be successful", async () => {
			const email = "email@gmail.com";

			const registerBody = {...validValues, email};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);

			expect(registerResponse.status).toEqual(201);
			expect(registerResponse.type).toBe("application/json");
		});

		test("email with invalid format", async () => {
			const email = "email";

			const registerBody = {...validValues, email};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);

			const expectedError = {
				...validationErrors.email.isEmail,
				value: email
			};

			expect(registerResponse.status).toBe(400);
			expect(registerResponse.type).toBe("application/json");
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("email is too long", async () => {
			const email = `${"a".repeat(64)}@${"a".repeat(64)}.com`;

			const registerBody = {...validValues, email};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);

			const expectedError = {
				...validationErrors.email.isEmail,
				value: email
			};

			expect(registerResponse.status).toBe(400);
			expect(registerResponse.type).toBe("application/json");
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("email is empty", async () => {
			const email = "";

			const registerBody = {...validValues, email};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);

			const expectedError = {
				...validationErrors.email.notEmpty,
				value: email
			};

			expect(registerResponse.status).toBe(400);
			expect(registerResponse.type).toBe("application/json");
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("email is not a string", async () => {
			const email = true;

			const registerBody = {...validValues, email};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);

			const expectedError = {
				...validationErrors.email.isString,
				value: email
			};

			expect(registerResponse.status).toBe(400);
			expect(registerResponse.type).toBe("application/json");
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
		});

		test("email doesn't exist", async () => {
			const registerBody = {
				password: validValues.password,
				username: validValues.username
			};

			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(registerBody);

			const expectedError = validationErrors.email.exists;

			expect(registerResponse.status).toBe(400);
			expect(registerResponse.type).toBe("application/json");
			expect(registerResponse.body).toHaveProperty(errMsgProp, errMsg);
			expect(registerResponse.body).toHaveProperty(errsProp);
			expect(registerResponse.body[errsProp]).toContainEqual(expectedError);
		});
	});
});
