import {UserDTOData} from "../../dtos/user";

type GetAllResBody = UserDTOData[];

interface GetAllServiceReturn {
	users: UserDTOData[];
	totalCount: number;
}

interface GetAllResHeaders {
	"X-Total-Count": number;
}

export type {GetAllResBody, GetAllResHeaders, GetAllServiceReturn};
