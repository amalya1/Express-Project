import RefreshToken from "../models/refreshToken";
import {RetToken} from "../common/types";


class AuthController {
  constructor() {
    this.createRefreshToken = this.createRefreshToken.bind(this);
    this.findRefreshToken = this.findRefreshToken.bind(this);
    this.deleteRefreshToken = this.deleteRefreshToken.bind(this);

  }


   async createRefreshToken(userId: number, token: string): Promise<void> {
       await RefreshToken.create({token, userId});
   }


  async findRefreshToken(token: string): Promise<RetToken> {
    return RefreshToken.findOne({
        rejectOnEmpty: undefined,
        where: {token},
        raw: true
    });
  }


  async deleteRefreshToken(token: string): Promise<void> {
      await RefreshToken.destroy({where: { token } });
  }
}

export default new AuthController();
