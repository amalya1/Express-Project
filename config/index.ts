import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from "../src/models/user";
import File from "../src/models/file";
import Token from "../src/models/token";

dotenv.config();

const connection = new Sequelize({
    dialect: 'mysql',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    operationsAliases: false,
    models: [User, File, Token],
});

 const jwtToken = {
     secretAccessToken: process.env.SECRET_ACCESS_TOKEN,
     expiresInAccessToken: process.env.EXPIRE_ACCESS_TOKEN,
     secretRefreshToken: process.env.SECRET_REFRESH_TOKEN,
     expiresInRefreshToken: process.env.EXPIRE_REFRESH_TOKEN,
}

export  {jwtToken, connection};
