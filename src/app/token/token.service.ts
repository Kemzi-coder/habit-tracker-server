import jwt from "jsonwebtoken";
import pool from "../../db";
import {TokenModel} from "./token.types";
import {UserDTOData} from "../../dtos/user";

class TokenService {
	static generateTokens(payload: UserDTOData) {
		const accessToken = jwt.sign(
			payload,
			process.env.JWT_SECRET_ACCESS_KEY as string,
			{
				expiresIn: "30m"
			}
		);
		const refreshToken = jwt.sign(
			payload,
			process.env.JWT_SECRET_REFRESH_KEY as string,
			{
				expiresIn: "30d"
			}
		);

		return {accessToken, refreshToken};
	}

	static validateAccessToken(token: string): UserDTOData {
		const userData = jwt.verify(
			token,
			process.env.JWT_SECRET_ACCESS_KEY as string
		) as UserDTOData;
		return userData;
	}

	static validateRefreshToken(token: string): UserDTOData {
		const userData = jwt.verify(
			token,
			process.env.JWT_SECRET_REFRESH_KEY as string
		) as UserDTOData;
		return userData;
	}

	static async saveToken(userId: number, refreshToken: string) {
		// If token not exists, create new token, otherwise update the existing one
		const token = (
			await pool.query<TokenModel>(
				`INSERT INTO tokens(user_id, refresh_token) VALUES ('${userId}', '${refreshToken}')
				ON CONFLICT (user_id) DO UPDATE SET refresh_token='${refreshToken}'
				RETURNING *;`
			)
		).rows[0];
		return token;
	}

	static async deleteToken(refreshToken: string) {
		const token = (
			await pool.query<TokenModel>(
				`DELETE FROM tokens WHERE refresh_token='${refreshToken}' RETURNING *;`
			)
		).rows[0];
		return token;
	}

	static async findToken(refreshToken: string) {
		const token = (
			await pool.query<TokenModel>(
				`SELECT * FROM tokens WHERE refresh_token='${refreshToken}';`
			)
		).rows[0];
		return token;
	}
}

export default TokenService;
