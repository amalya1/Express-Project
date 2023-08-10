export interface UserData {
  password: string;
  userName: string;
}

export type UserLogin = {
  userName: string;
  password: string;
};

export type UserLoginResponse = {
  isRevoked?: boolean;
  id: number;
  userName?: string;
};

export type Token = {
  token: string;
};

export interface UpdateFileResult {
  existingPath: RetFile;
  updateResult: any;
}

export interface DeleteFileResult {
  existingPath: RetFile;
  deleteResult: number;
}

export interface RetFiles {
  rows: RetFile[];
  count: number;
}
export type RetUser = {
  id: number;
  password: string;
  userName: string;
  timeStamp: number;
};

export type RetFile = {
  dataValues
  id?: number;
  userId?: number;
  originName: string;
  mimeType: string;
  type: string;
  size: number;
  path?: string;
  timeStamp?: number;
};

export type Auth = UserLoginResponse;
