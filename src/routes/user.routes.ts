import express from 'express';
import userManager from '../managers/userManager';
import { verifyJWT } from '../middlewares/auth.middlewares/verifyJWT';
import {validateData} from "../middlewares/validate.middlewares/validation.middlewares";
import {createUserSchema} from "../middlewares/validate.middlewares/validation";

const router = express.Router();

router.post('/signUp', validateData(createUserSchema), async (req: express.Request, res: express.Response) => {
    try {
        const result = await userManager.createUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.json(error);
    }
});

router.get('/:userId', verifyJWT, async (req: express.Request, res: express.Response) => {
    const { userId } = req.params;
    try {
        const result = await userManager.getUser(userId);
        res.status(200).json(result);
    } catch (error) {
        res.json(error);
    }
});

export default router;
