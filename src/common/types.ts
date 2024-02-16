declare module 'express' {
  interface Request {
    user?: string;
    userId?: number;
  }
}

export interface UserData {
  userName: string
  password: string
}

export type RetUser = {
  id: number
  userName: string
  password: string
  timeStamp: number
};



export type RetToken = {
  id: number
  token: string
  userId: number
  createdAt: string
};

export type JWTPayload = {
  id: number
  userName: string
};

export type AuthToken = {
  user: JWTPayload
  accessToken: string
  refreshToken: string
}

export type Token = {
  token: string
};



export interface RetFiles {
  rows: RetFile[]
  count: number
}

export type RetFile = {
  dataValues
  id?: number
  userId?: number
  originName: string
  mimeType: string
  type: string
  size: number
  path?: string
  timeStamp?: number
};