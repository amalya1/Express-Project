import User from "../models/User";
import {RetUser, RetUsers, UserData} from "../types";
import * as bcrypt from 'bcrypt';
import moment from 'moment';


class UserController {
  constructor() {
    this.hashPassword = this.hashPassword.bind(this);
    this.findUserByEmail = this.findUserByEmail.bind(this);
    this.updateUserLogTime = this.updateUserLogTime.bind(this);
    this.createUser = this.createUser.bind(this);
    this.getAll = this.getAll.bind(this);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async findUserByEmail(email: string) : Promise<RetUser | never>{
    return User.findOne({ where: { email } });
  }

  async updateUserLogTime(id: number, time: number): Promise<void> {
    await User.update({ timeStamp: time }, {where: {id}, returning: true});
  }

  async createUser(body: UserData): Promise<void | never> {
    const password = body.password;
    const hashPassword = await this.hashPassword(password);
    await User.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hashPassword,
      timeStamp: moment().unix(),
    });
  }

  async getAll (req) : Promise<RetUsers | never>{
    const { limit = "100", offset = "0" } = req.params;

    try {
     return await User.findAndCountAll({
       attributes: { exclude: ["password"] },
       limit: Number(limit), // Convert to a number, assuming you want numeric values
       offset: Number(offset), // Convert to a number, assuming you want numeric values
     });
    } catch (error) {
      throw new Error("Failed to get users.");
    }
  }
}

export default new UserController();
