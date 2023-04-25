import request from "supertest";
import jwt from "jsonwebtoken";
import {UserModel} from "../../../src/models/user";
import pg from "pg";
import {UserDTO, UserDTOData} from "../../../src/dtos/user";
import app, {server} from "../../../src";

const {Pool} = pg;

describe("GET /api/user", () => {
	let token: string;
	let pool: pg.Pool;

	// Before all tests
	beforeAll(async () => {
		// Generate mock JWT access token
		token = jwt.sign({}, process.env.JWT_SECRET_ACCESS_KEY as string, {
			expiresIn: "1m"
		});
		// Connect to the test database
		pool = new Pool({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_TEST_DATABASE,
			port: 5432
		});
		// Delete all users
		await pool.query("DELETE FROM users;");
	});

	// After each test
	afterEach(async () => {
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

	// A mock list of users for inserting in a test database
	const mockUsers: UserModel[] = [
		{
			id: 1,
			username: "John Doe",
			email: "johndoe@example.com",
			password: "password",
			created_date: "2023-04-19T07:03:19.653Z"
		},
		{
			id: 2,
			username: "Jane Doe",
			email: "janedoe@example.com",
			password: "password",
			created_date: "2023-04-19T07:03:19.653Z"
		}
	];
	// A mock list of users that should be in response body
	const mockResponse: UserDTOData[] = mockUsers.map(user => ({
		...new UserDTO(user)
	}));

	test("responds with JSON array of users", async () => {
		// Insert mock users to the test database
		await pool.query(`INSERT INTO users (id, username, email, password, created_date) VALUES 
		('${mockUsers[0].id}', '${mockUsers[0].username}', '${mockUsers[0].email}', '${mockUsers[0].password}', '${mockUsers[0].created_date}'),
		('${mockUsers[1].id}', '${mockUsers[1].username}', '${mockUsers[1].email}', '${mockUsers[1].password}', '${mockUsers[1].created_date}');`);

		const response = await request(app)
			.get("/api/user")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.type).toBe("application/json");
		expect(response.body).toEqual(mockResponse);
	});

	test("responds with an empty JSON array", async () => {
		const response = await request(app)
			.get("/api/user")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.type).toBe("application/json");
		expect(response.body).toEqual([]);
	});

	test("responds with unauthorized error", async () => {
		const response = await request(app).get("/api/user");

		expect(response.status).toBe(401);
		expect(response.type).toBe("application/json");
		expect(response.body).toHaveProperty("message");
		expect(typeof response.body.message).toBe("string");
	});
});
