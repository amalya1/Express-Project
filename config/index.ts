import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const connection = new Sequelize({
    dialect: 'postgres',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    schema: 'public',
    models: [User],
    logging: false,
});

 const jwtToken = {
    secret: process.env.SECRET_JWT,
    expiresIn: process.env.EXPIRE_JWT,
}
export  {jwtToken, connection};
