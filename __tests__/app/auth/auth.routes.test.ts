import request from "supertest";
import {UserModel} from "../../../src/models/user";
import pg from "pg";
import app, {server} from "../../../src";

const {Pool} = pg;
let pool: pg.Pool;

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
	// Stop the server
	await server.close();
});

// After all tests
afterAll(async () => {
	// Delete all tokens
	await pool.query("DELETE FROM tokens;");
	// Delete all users
	await pool.query("DELETE FROM users;");
	// End database connection
	pool.end();
});

// A mock list of users for inserting in a test database
const mockUser: Pick<UserModel, "username" | "email" | "password"> = {
	username: "John Doe",
	email: "johndoe@example.com",
	password: "Password1"
};

describe("POST /api/auth/register", () => {
	beforeEach(async () => {
		// Delete all tokens
		await pool.query("DELETE FROM tokens;");
		// Delete all users
		await pool.query("DELETE FROM users;");
	});

	test("should set refresh token cookie", async () => {
		const response = await request(app)
			.post("/api/auth/register")
			.send(mockUser);

		expect(response.status).toBe(201);
		expect(response.type).toBe("application/json");
		expect(response.headers).toHaveProperty("set-cookie");
		expect(response.headers["set-cookie"][0]).toContain("refreshToken");
	});

	test("responds with JSON object of the registered user", async () => {
		const response = await request(app)
			.post("/api/auth/register")
			.send(mockUser);

		expect(response.status).toBe(201);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("user");
		expect(response.body.user).toMatchObject({
			username: mockUser.username,
			email: mockUser.email
		});
		expect(response.body).toHaveProperty("tokens.refreshToken");
		expect(response.body).toHaveProperty("tokens.accessToken");
	});

	test("responds with bad request error (user with email is already exists)", async () => {
		// Register a new user
		await request(app)
			.post("/api/auth/register")
			.send({...mockUser, username: "username"});

		const expectedMessage = `The user with email: ${mockUser.email} is already exists.`;

		const response = await request(app)
			.post("/api/auth/register")
			.send(mockUser);

		expect(response.status).toBe(400);
		expect(response.type).toBe("application/json");
		expect(response.body).toEqual({message: expectedMessage});
	});

	test("responds with bad request error (user with username is already exists)", async () => {
		// Register a new user
		await request(app)
			.post("/api/auth/register")
			.send({...mockUser, email: "email@gmail.com"});

		const expectedMessage = `The user with username: ${mockUser.username} is already exists.`;

		const response = await request(app)
			.post("/api/auth/register")
			.send(mockUser);

		expect(response.status).toBe(400);
		expect(response.type).toBe("application/json");
		expect(response.body).toEqual({message: expectedMessage});
	});
});

describe("POST /api/auth/login", () => {
	beforeAll(async () => {
		// Delete all tokens
		await pool.query("DELETE FROM tokens;");
		// Delete all users
		await pool.query("DELETE FROM users;");
		// Register a new user
		await request(app).post("/api/auth/register").send(mockUser);
	});

	const body = {
		username: mockUser.username,
		password: mockUser.password
	};

	test("should set a refresh token cookie", async () => {
		const response = await request(app).post("/api/auth/login").send(body);

		expect(response.status).toBe(200);
		expect(response.type).toBe("application/json");
		expect(response.headers).toHaveProperty("set-cookie");
		expect(response.headers["set-cookie"][0]).toContain("refreshToken");
	});

	test("responds with JSON object of the logined user", async () => {
		const response = await request(app).post("/api/auth/login").send(body);

		expect(response.status).toBe(200);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("user");
		expect(response.body.user).toMatchObject({username: mockUser.username});
		expect(response.body).toHaveProperty("tokens.refreshToken");
		expect(response.body).toHaveProperty("tokens.accessToken");
	});

	test("responds with bad request error (wrong password)", async () => {
		const passwordToPass = "Password2";
		const expectedMessage = "Wrong password.";

		const response = await request(app)
			.post("/api/auth/login")
			.send({...body, password: passwordToPass});

		expect(response.status).toBe(400);
		expect(response.type).toBe("application/json");
		expect(response.body).toEqual({message: expectedMessage});
	});

	test("responds with bad request error (wrong username)", async () => {
		const usernameToPass = "username";
		const expectedMessage = `There is no user with username: ${usernameToPass}.`;

		const response = await request(app)
			.post("/api/auth/login")
			.send({...body, username: usernameToPass});

		expect(response.status).toBe(400);
		expect(response.type).toBe("application/json");
		expect(response.body).toEqual({message: expectedMessage});
	});
});

describe("POST /api/auth/logout", () => {
	let refreshToken: string;

	beforeAll(async () => {
		// Delete all tokens
		await pool.query("DELETE FROM tokens;");
		// Delete all users
		await pool.query("DELETE FROM users;");
		// Register a new user
		const response = await request(app)
			.post("/api/auth/register")
			.send(mockUser);
		refreshToken = response.body.tokens.refreshToken;
	});

	test("responds with success message", async () => {
		const response = await request(app)
			.post("/api/auth/logout")
			.set("Cookie", [`refreshToken=${refreshToken}`]);

		expect(response.status).toBe(200);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("message", "Logout successful.");
	});

	test("responds with an unathorized error", async () => {
		const response = await request(app).post("/api/auth/logout");

		expect(response.status).toBe(401);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("message");
	});
});

describe("POST /api/auth/refresh", () => {
	let refreshToken: string;

	beforeAll(async () => {
		// Delete all tokens
		await pool.query("DELETE FROM tokens;");
		// Delete all users
		await pool.query("DELETE FROM users;");
		// Register a new user
		const response = await request(app)
			.post("/api/auth/register")
			.send(mockUser);
		refreshToken = response.body.tokens.refreshToken;
	});

	test("responds with JSON object of user and tokens", async () => {
		const response = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", [`refreshToken=${refreshToken}`]);

		expect(response.status).toBe(200);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("user");
		expect(response.body.user).toMatchObject({username: mockUser.username});
		expect(response.body).toHaveProperty("tokens.refreshToken");
		expect(response.body).toHaveProperty("tokens.accessToken");
	});

	test("responds with an unathorized error", async () => {
		const response = await request(app).post("/api/auth/logout");

		expect(response.status).toBe(401);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("message");
	});
});
