import {Auth} from "../types";
import {jwtToken} from "../../config";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export async function generateToken(user: Auth): Promise<string>  {
    const payload = { user };
   return jwt.sign(payload,
        jwtToken.secret,
        { expiresIn: jwtToken.expiresIn });
}
