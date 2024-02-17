import userController from "../controllers/userController";
import authController from "../controllers/authController";
import {generateToken} from "../middlewares/auth.middlewares/jwt";
import {redisClient} from "../redis/redis";
import { AppError } from '../common/errors';
import {AuthToken, UserData} from "../common/types";
import * as bcrypt from "bcrypt";


class UserManager {
  constructor() {
    this.createUser = this.createUser.bind(this);
    this.getUser = this.getUser.bind(this);
  }


  async createUser(input: UserData): Promise<AuthToken>{
    const userName = input.userName;

    const existUser = await userController.findUserByUserName(userName);
    if (existUser) throw { message: AppError.USER_EXIST, statusCode: 409 };

    const hashPassword = await this.hashPassword(input.password);
    const createdUser = await userController.createUser({userName, password: hashPassword});

    const user = { id: createdUser.id, userName: createdUser.userName };

    const { accessToken, refreshToken } = generateToken(user);

    await redisClient.set(accessToken, JSON.stringify(user));

    await authController.createRefreshToken(user.id, refreshToken);

    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
    };
  }


  async getUser(userId: string): Promise<string> {
      const user = await userController.findUserById(userId);
      if (!user) throw { message: AppError.USER_NOT_FOUND, statusCode: 404 };
      return user.userName;
  }


   async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}

export default new UserManager();
