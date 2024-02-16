import express from 'express';
import {connection} from '../config';
import {redisClient} from "./redis/redis";
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import fileRoutes from './routes/file.routes';

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(express.json());

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);



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
