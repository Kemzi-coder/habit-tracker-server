import bcryptjs from "bcryptjs";
import pool from "../../db";
import {UserDTO} from "../../dtos/user";
import ApiError from "../../entities/apiError/apiError.entity";
import {UserModel} from "../../models/user";
import {TokenService} from "../token";
import {AuthResBody, LoginReqBody, RegisterReqBody} from "./auth.types";
import UserService from "../user/user.service";

class AuthService {
	static async register({
		email,
		password,
		username
	}: RegisterReqBody): Promise<AuthResBody> {
		const candidate1 = (
			await pool.query<UserModel>(`SELECT * FROM users WHERE email='${email}';`)
		).rows[0];
		const candidate2 = (
			await pool.query<UserModel>(
				`SELECT * FROM users WHERE username='${username}';`
			)
		).rows[0];

		if (candidate1) {
			throw ApiError.getBadRequest(
				`The user with email: ${email} is already exists.`
			);
		}

		if (candidate2) {
			throw ApiError.getBadRequest(
				`The user with username: ${username} is already exists.`
			);
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

		const user = (
			await pool.query<UserModel>(`INSERT INTO users(username, email, password) VALUES (
			'${username}',
			'${email}',
			'${hashedPassword}'
		) RETURNING *;`)
		).rows[0];

		const userDTO = new UserDTO(user);

		const tokens = TokenService.generateTokens({...userDTO});
		await TokenService.saveToken(userDTO.id, tokens.refreshToken);

		return {user: {...userDTO}, tokens};
	}

	static async login({password, username}: LoginReqBody): Promise<AuthResBody> {
		const candidate = (
			await pool.query<UserModel>(
				`SELECT * FROM users WHERE username='${username}'`
			)
		).rows[0];

		if (!candidate) {
			throw ApiError.getBadRequest(
				`There is no user with username: ${username}.`
			);
		}

		const passwordIsValid = await bcryptjs.compare(
			password,
			candidate.password
		);

		if (!passwordIsValid) {
			throw ApiError.getBadRequest(`Wrong password.`);
		}

		const userDTO = new UserDTO(candidate);

		const tokens = TokenService.generateTokens({...userDTO});
		await TokenService.saveToken(userDTO.id, tokens.refreshToken);

		return {user: {...userDTO}, tokens};
	}

	static async logout(refreshToken: string) {
		if (!refreshToken) {
			throw ApiError.getUnathorized();
		}

		const userData = TokenService.validateRefreshToken(refreshToken);
		const tokenFromDb = await TokenService.findToken(refreshToken);

		if (!userData || !tokenFromDb) {
			throw ApiError.getUnathorized();
		}

		const token = await TokenService.deleteToken(refreshToken);
		return token;
	}

	static async refresh(refreshToken: string) {
		if (!refreshToken) {
			throw ApiError.getUnathorized();
		}

		const userData = TokenService.validateRefreshToken(refreshToken);
		const tokenFromDb = await TokenService.findToken(refreshToken);

		if (!userData || !tokenFromDb) {
			throw ApiError.getUnathorized();
		}

		const user = await UserService.getById(userData.id);
		const userDTO = new UserDTO(user);

		const tokens = TokenService.generateTokens({...userDTO});
		await TokenService.saveToken(userDTO.id, tokens.refreshToken);

		return {tokens, user: {...userDTO}};
	}
}

export default AuthService;
