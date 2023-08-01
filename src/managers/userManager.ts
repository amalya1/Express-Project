import controller from "../controllers/userController";
import {generateToken} from "../middleware/jwt";
import {redisClient} from "../redis/redis";
import { AppError } from '../common/errors';
import {Request, Response} from "express";
import moment from 'moment';
import * as bcrypt from 'bcrypt';


class UserManager {
  constructor() {
    this.addUser = this.addUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  async addUser(req: Request, res: Response): Promise<Response> {
    const email = req.body.email.toLowerCase();
    const existUser = await controller.findUserByEmail(email);
    if (existUser) {
      res.status(409).json({ message: AppError.USER_EXIST });
    }
    await controller.createUser({...req.body, email});

    return res.status(201).json({ message: AppError.USER_CREATED });
  }

  async loginUser(req: Request, res: Response): Promise<Response>{
    const email = req.body.email;
    const existUser = await controller.findUserByEmail(email);

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
      email: existUser.email,
    };

    const jwtToken = await generateToken(auth);
    await redisClient.set(jwtToken, JSON.stringify(auth));

    return res.status(200).json({ ...auth, token: jwtToken });
  }

  async getUsers(req: Request, res: Response): Promise<Response> {
    const users = await controller.getAll(req);

    return res.status(200).json(users);
  }
}

export default new UserManager();
