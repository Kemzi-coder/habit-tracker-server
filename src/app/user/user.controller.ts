import {Request, Response, NextFunction} from "express";
import UserService from "./user.service";
import {GetAllResBody, GetAllResHeaders} from "./user.types";

class UserController {
	static async getAll(
		req: Request<{}, GetAllResBody, {}, {}>,
		res: Response<GetAllResBody>,
		next: NextFunction
	) {
		try {
			const {users, totalCount} = await UserService.getAll();
			const headers: GetAllResHeaders = {
				"X-Total-Count": totalCount
			};

			res.set(headers);
			res.json(users);
		} catch (e) {
			next(e);
		}
	}
}

export default UserController;
