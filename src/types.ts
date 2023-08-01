export interface UserData {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}

export interface RetUsers {
  rows: RetUser[];
  count: number;
}

export interface GetAllRequestParams {
  limit?: number;
  offset?: number;
}

export type UserLogin = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  id: number;
  email: string;
  token?: string;
};

export type RetUser = {
  id: number;
  firstName: string;
  lastName: string;
  password?: string;
  email: string;
  timeStamp: number;
};

export type Auth = UserLoginResponse;
