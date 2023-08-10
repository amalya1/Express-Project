import {Auth} from "../common/types";
import {jwtToken} from "../../config";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Token from "../models/token";

dotenv.config();


export async function generateToken(user: Auth): Promise<[string, string]>  {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const userId = user.id;
    const payload = { user,
         expAccessToken: currentTimestamp + jwtToken.expiresInAccessToken,
         expRefreshToken: currentTimestamp + jwtToken.expiresInAccessToken
    };

    const accessToken = jwt.sign(payload, jwtToken.secretAccessToken, { expiresIn: jwtToken.expiresInAccessToken });
    const refreshToken = jwt.sign(payload, jwtToken.secretRefreshToken, { expiresIn: jwtToken.expiresInRefreshToken });

    await Token.destroy(
        {where: { userId: userId } }
    );

    await Token.create({
        userId,
        token: refreshToken,
        expirationDate: payload.expRefreshToken,
    });

    return  [accessToken, refreshToken ];
}
