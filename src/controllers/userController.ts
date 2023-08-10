import User from "../models/user";
import { RetUser, UserData} from "../common/types";
import * as bcrypt from 'bcrypt';
import moment from 'moment';
import Token from "../models/token";


class UserController {
  constructor() {
    this.findUserByEmail = this.findUserByEmail.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUserLogTime = this.updateUserLogTime.bind(this);
    this.findRefreshToken = this.findRefreshToken.bind(this);
    this.deleteToken = this.deleteToken.bind(this);
    this.findUserById = this.findUserById.bind(this);
    this.hashPassword = this.hashPassword.bind(this);

  }

  async findUserByEmail(userName: string) : Promise<RetUser>{
        return User.findOne({ where: { userName: userName } });
    }

   async createUser(body: UserData): Promise<RetUser> {
        const password = body.password;
        const hashPassword = await this.hashPassword(password);
        return await User.create({
            userName: body.userName,
            password: hashPassword,
            timeStamp: moment().unix(),
        });
   }

   async updateUserLogTime(id: number, time: number): Promise<void> {
        await User.update({ timeStamp: time }, {where: {id}, returning: true});
   }

  async findRefreshToken(userId: number, token: string) {
    return Token.findOne({ where: { userId, token } });
  }

  async deleteToken(userId: number): Promise<void> {
      await Token.destroy(
          {where: { userId } }
      );
  }

  async findUserById(id: number) : Promise<RetUser | never>{
        return User.findOne({ where: { id },
            attributes: ['userName'],
            raw: true,});
  }

  async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
  }
}

export default new UserController();
