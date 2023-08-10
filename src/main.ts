import 'reflect-metadata';
import express, { Request, Response } from 'express';
import {connection} from '../config';
import {
    createUserSchema,
    loginInputSchema,
    tokenInputSchema,
} from "./middlewares/validation";
import {authenticateToken} from "./middlewares/authJwt";
import userManager from "./managers/userManager";
import {redisClient} from "./redis/redis";
import multer from 'multer';
import session from 'express-session';
import fileManager from "./managers/fileManager";

const app = express();
const upload = multer();


app.use( session({
    name: 'SESSION_ID',
    secret: 'my_secret',
    cookie: {
        maxAge: 30 * 86400000,
    },
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());

app.get('/', (req: Request, res: Response): Response => res.json({ message: 'Sequelize Example 🤟' }));


app.post("/signUp", async (req: Request, res: Response) => {
    const { error} = createUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    await userManager.addUser(req, res);
});

app.post("/signIn", async (req: Request, res: Response) => {
    const { error} = loginInputSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    await userManager.loginUser(req, res);
});

app.post("/authRefresh", async (req: Request, res: Response) => {
    const { error} = tokenInputSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    await userManager.refreshToken(req, res);
});

app.get("/info", authenticateToken, async (req: Request, res: Response) => {
    await userManager.getUser(req, res);
});

app.get('/logout', authenticateToken, async (req: Request, res: Response) => {
    await userManager.revokedToken(req, res);
});

app.post('/file/upload', authenticateToken, upload.single('file'), async  (req: Request, res: Response) => {
    await fileManager.uploadFile(req, res);
})

app.put('/file/update/:id', authenticateToken, upload.single('file'), async  (req: Request, res: Response) => {
    await fileManager.updateFile(req, res);
})

app.get('/file/download/:id', authenticateToken, async  (req: Request, res: Response) => {
    await fileManager.downloadFile(req, res);
})

app.get('/file/list', authenticateToken, async (req: Request, res: Response) => {
    await fileManager.getFiles(req, res);
});

app.get('/file/:id', authenticateToken, async (req: Request, res: Response) => {
    await fileManager.getFile(req, res);
});

app.delete('/file/delete/:id', authenticateToken, async (req: Request, res: Response) => {
    await fileManager.deleteFile(req, res);
});


const start = async (): Promise<void> => {
    try {
        await redisClient.connect();
        await connection.authenticate();
        await connection.sync();
        app.listen(3004, () => {
            console.log('Server started on port 3004');
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

start();
