import express, {Request, Response} from 'express';
import authManager from '../managers/authManager';
import { validateData } from '../middlewares/validate.middlewares/validation.middlewares';
import {loginSchema, tokenSchema} from "../middlewares/validate.middlewares/validation";
import {verifyJWT} from "../middlewares/auth.middlewares/verifyJWT";

const router = express.Router();



router.post("/token", validateData(loginSchema), async (req: Request, res: Response) => {
    try {
        const result = await authManager.loginUser(req.body);
        res.json(result);
    } catch (error) {
        res.json(error);
    }
});


router.post("/refresh-token", validateData(tokenSchema), async (req: Request, res: Response) => {
    try {
        const result = await authManager.refreshToken(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.json(error);
    }
});


router.delete('/logout', verifyJWT, validateData(tokenSchema), verifyJWT, async (req: Request, res: Response) => {
    try {
        await authManager.logout(req.body);
        res.sendStatus(200);
    } catch (error) {
        res.json(error);
    }});


export default router;
