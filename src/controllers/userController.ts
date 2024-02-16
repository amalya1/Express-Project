import User from "../models/user";
import { RetUser, UserData} from "../common/types";
import moment from 'moment';


class UserController {
  constructor() {
    this.findUserByUserName = this.findUserByUserName.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUserLogTime = this.updateUserLogTime.bind(this);
    this.findUserById = this.findUserById.bind(this);
  }


  async findUserById(id: string) : Promise<RetUser>{
      return User.findOne({
          rejectOnEmpty: undefined,
          where: { id },
          raw: true });
  }


  async findUserByUserName(userName: string) : Promise<RetUser>{
        return User.findOne({
            rejectOnEmpty: undefined,
            where: { userName },
            raw: true });
    }


    async createUser(data: UserData): Promise<RetUser> {
        return await User.create({
            userName: data.userName,
            password: data.password,
            timeStamp: moment().unix(),
        });
   }


   async updateUserLogTime(id: number): Promise<void> {
        await User.update({ timeStamp: moment().unix() }, {where: {id}, returning: true});
   }
}

export default new UserController();
