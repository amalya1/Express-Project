import jwt from 'jsonwebtoken';
import {jwtToken} from "../../../config";
import {JWTPayload} from "../../common/types";
import {AppError} from "../../common/errors";
import { Request, Response, NextFunction } from 'express';


export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({error: 'Access denied. No token provided.'});
    }

    try {
        const decoded = jwt.verify(token, jwtToken.secretAccessToken) as JWTPayload;
        req.user = decoded.userName;
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({message: AppError.INVALID_TOKEN});
    }
}
