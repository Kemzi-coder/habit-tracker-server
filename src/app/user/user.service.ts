import pool from "../../db";
import {UserDTOData} from "../../dtos/user";
import {UserModel} from "../../models/user";
import {GetAllServiceReturn} from "./user.types";

class UserService {
	static async getAll(): Promise<GetAllServiceReturn> {
		const users = await pool.query<UserDTOData>(
			"SELECT username, email, id, created_date FROM users;"
		);
		return {users: users.rows, totalCount: users.rowCount};
	}

	static async getById(id: number) {
		const user = (
			await pool.query<UserModel>(`SELECT * FROM users WHERE id='${id}';`)
		).rows[0];
		return user;
	}
}

export default UserService;
