import {UserModel} from "../../models/user";
import {UserDTOData} from "./user.types";

class UserDTO implements UserDTOData {
	username: UserModel["username"];

	email: UserModel["email"];

	id: UserModel["id"];

	created_date: UserModel["created_date"];

	constructor(user: UserModel) {
		this.username = user.username;
		this.id = user.id;
		this.email = user.email;
		this.created_date = user.created_date;
	}
}

export default UserDTO;
