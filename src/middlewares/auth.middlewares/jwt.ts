import {JWTPayload} from "../../common/types";
import {jwtToken} from "../../../config";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


export function generateToken(payload: JWTPayload):  { accessToken: string, refreshToken: string } {
    const accessToken = jwt.sign(
        payload,
        jwtToken.secretAccessToken,
        { expiresIn: jwtToken.expiresInAccessToken });

    const refreshToken = jwt.sign(
        payload,
        jwtToken.secretRefreshToken,
        { expiresIn: jwtToken.expiresInRefreshToken });

    return {accessToken, refreshToken} ;
}