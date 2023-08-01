import jwt, { JwtPayload } from 'jsonwebtoken';
import {jwtToken} from "../../config";

export const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        jwt.verify(token, jwtToken.secret) as JwtPayload;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token.' });
    }
};
