import 'reflect-metadata';
import express, { Request, Response } from 'express';
import {connection} from '../config';
import {createUserSchema, getAllRequestSchema, loginInputSchema} from "./validation";
import {authenticateToken} from "./middleware/authJwt";
import manager from "./managers/userManager";
import {redisClient} from "./redis/redis";

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response): Response => res.json({ message: 'Sequelize Example 🤟' }));


app.post("/user", async (req: Request, res: Response) => {
    const { error} = createUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    await manager.addUser(req, res);
});

app.post("/login", async (req: Request, res: Response) => {
    const { error} = loginInputSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    await manager.loginUser(req, res);
});

app.get("/users", authenticateToken, async (req: Request, res: Response) => {
    const { error} = getAllRequestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    await manager.getUsers(req, res);
});


const start = async (): Promise<void> => {
    try {
        await redisClient.connect();
        await connection.authenticate();
        await connection.sync();
        app.listen(3004, () => {
            console.log('Server started on port 3005');
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
