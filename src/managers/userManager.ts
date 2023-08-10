import controller from "../controllers/userController";
import {generateToken} from "../middlewares/jwt";
import {redisClient} from "../redis/redis";
import { AppError } from '../common/errors';
import {Request, Response} from "express";
import moment from 'moment';
import * as bcrypt from 'bcrypt';
import jwt, {JwtPayload} from "jsonwebtoken";
import {jwtToken} from "../../config";


class UserManager {
  constructor() {
    this.addUser = this.addUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.getUser = this.getUser.bind(this);
    this.revokedToken = this.revokedToken.bind(this);
  }

  async addUser(req: Request, res: Response): Promise<Response> {
        const userName = req.body.userName.toLowerCase();

        const existUser = await controller.findUserByEmail(userName);
        if (existUser) {
          res.status(409).json({ message: AppError.USER_EXIST });
        }

        const user = await controller.createUser({...req.body, userName});
        if(user) {
            const auth = {
                id: user.id,
                userName: user.userName,
            };

            const [accessToken, refreshToken]: [string, string] = await generateToken(auth);
            await redisClient.set(accessToken, JSON.stringify(auth));

            const token = {
                jwtAccess: accessToken,
                jwtRefresh: refreshToken,
            };

            return res.status(200).json({ message: AppError.USER_CREATED, ...auth, token });
        }
        return res.status(201).json({ message: AppError.USER_CREATION_FAILED });
  }

  async loginUser(req: Request, res: Response): Promise<Response>{
        const userName = req.body.userName;
        const existUser = await controller.findUserByEmail(userName);

        if (!existUser) {
          res.status(400).json({ message: AppError.USER_NOT_EXIST });
        }
        const validatePassword = await bcrypt.compare(
            req.body.password,
            existUser.password,
        );
        if (!validatePassword) {
          res.status(400).json({ message: AppError.WRONG_DATA });
        }
        await controller.updateUserLogTime(existUser.id, moment().unix());

        const auth = {
          id: existUser.id,
          userName: existUser.userName,
          isRevoked: false,
        };
        const [accessToken, refreshToken]: [string, string] = await generateToken(auth);
        await redisClient.set(accessToken, JSON.stringify(auth));
        const token = {
          jwtAccess: accessToken,
          jwtRefresh: refreshToken,
        };

        return res.status(200).json({ ...auth, token });
  }

  async refreshToken(req: Request, res: Response): Promise<Response> {
      const  refreshToken= req.body.token;
      const decodedToken = jwt.verify(refreshToken, jwtToken.secretRefreshToken) as JwtPayload;
      const id = decodedToken.user.id
      const userName = decodedToken.user.userName

      const auth = {
          id,
          userName,
          isRevoked: false,
      };

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const token = await controller.findRefreshToken(id, refreshToken);
      if (currentTimestamp < parseInt(token.expirationDate)) {
           const [ accessToken, refreshToken ] = await generateToken(auth);
           return res.status(200).json({ accessToken, refreshToken });
      }
      await controller.deleteToken(id);
      return res.status(201).json({ message: 'token expired' });
  }

  async getUser(req, res: Response): Promise<Response> {
      const id = req.userId;
      const { userName } = await controller.findUserById(id);
      return res.status(200).json(userName);
  }

   async revokedToken(req, res: Response){
        const id = req.userId;

        const auth = { id, isRevoked: true };
        const [accessToken] = await generateToken(auth);

        await controller.deleteToken(id);

        req.session.destroy();
        res.status(200).json(accessToken);
        // res.clearCookie('authCookie')
        // res.redirect('/signIn')
   }
}

export default new UserManager();
