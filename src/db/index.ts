import pg from "pg";

const {Pool} = pg;

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_TEST_DATABASE,
	port: 5432
});

export default pool;
