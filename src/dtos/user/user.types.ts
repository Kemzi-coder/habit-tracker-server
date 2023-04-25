import {UserModel} from "../../models/user";

type UserDTOData = Omit<UserModel, "password">;

export type {UserDTOData};
