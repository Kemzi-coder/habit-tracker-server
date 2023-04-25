import {UserDTOData} from "../../dtos/user";

interface RegisterReqBody {
	email: string;
	username: string;
	password: string;
}

interface LoginReqBody {
	username: string;
	password: string;
}

interface AuthResBody {
	user: UserDTOData;
	tokens: {
		accessToken: string;
		refreshToken: string;
	};
}

type LogoutResBody = {message: string};

interface AuthReqCookies {
	refreshToken: string;
}

export type {
	RegisterReqBody,
	LoginReqBody,
	AuthResBody,
	LogoutResBody,
	AuthReqCookies
};
