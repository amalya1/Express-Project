import authController from "../controllers/authController";
import userController from "../controllers/userController";
import {generateToken} from "../middlewares/auth.middlewares/jwt";
import {redisClient} from "../redis/redis";
import { AppError } from '../common/errors';
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {jwtToken} from "../../config";
import {AuthToken, JWTPayload, Token, UserData} from "../common/types";


class AuthManager {
  constructor() {
    this.loginUser = this.loginUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
  }


  async loginUser(input: UserData): Promise<AuthToken> {
      const existUser = await userController.findUserByUserName(input.userName);
      if (!existUser) throw { message: AppError.USER_NOT_FOUND, statusCode: 404 };

      const validatePassword = await bcrypt.compare(
          input.password,
          existUser.password,
      );
      if (!validatePassword) throw { message: AppError.WRONG_DATA, statusCode: 400 };

      await userController.updateUserLogTime(existUser.id);

      const user = {id: existUser.id, userName: existUser.userName};

      const { accessToken, refreshToken } = generateToken(user);

      await redisClient.set(accessToken, JSON.stringify(user));

      await authController.createRefreshToken(user.id, refreshToken);

      return {
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: user,
      };
  }


  async refreshToken(input: Token): Promise<AuthToken> {
      const { token } = input;

      const payload = await (async () => {
          try {
              return jwt.verify(token, jwtToken.secretRefreshToken)as JWTPayload;
          }
          catch (err) {
              await authController.deleteRefreshToken(token);
              throw { message: AppError.INVALID_TOKEN, statusCode: 401 };
          }
      })();

      if(payload == null) throw { message: AppError.INVALID_TOKEN, statusCode: 401 };
      const { id } = payload;

      const existed = await userController.findUserById(id.toString());
      if (!existed) throw { message: AppError.USER_NOT_FOUND, statusCode: 404 };

      const existedToken = await authController.findRefreshToken(token);
      if (!existedToken ) throw { message: AppError.INVALID_TOKEN, statusCode: 401 };

      const user = { id: existed.id, userName: existed.userName };

      const { accessToken, refreshToken } = generateToken(user);

      await authController.deleteRefreshToken(token);
      await authController.createRefreshToken(id, token);

      return {
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: user,
      };
  }


   async logout(input: Token): Promise<void> {
      const { token } = input;
       const existToken = await authController.findRefreshToken(input.token);
       if (!existToken) throw { message: AppError.INVALID_TOKEN, statusCode: 401 };

       await authController.deleteRefreshToken(token);
   }
}

export default new AuthManager();
