import * as bcrypt from 'bcrypt';
import moment from 'moment';
import File from "../models/file";
import {connection} from "../../config";
import {extname} from "path";
import {DeleteFileResult, RetFile, RetFiles, UpdateFileResult} from "../common/types";


class FileController {
  constructor() {
    this.createFile = this.createFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.findFileById = this.findFileById.bind(this);
    this.destroyFile = this.destroyFile.bind(this);
    this.getAll = this.getAll.bind(this);
    this.findFileInfoById = this.findFileInfoById.bind(this);
    this.hashPassword = this.hashPassword.bind(this);
  }

    async createFile(userId: number, file: Express.Multer.File, path: string): Promise<void> {
        const extensions = extname(file.originalname);
        await File.create({
            userId,
            originName: file.originalname,
            mimeType: file.mimetype,
            type: extensions,
            size: file.size,
            path,
            timeStamp: moment().unix(),
        });
    }

    async updateFile(id: number, userId: number, file: Express.Multer.File, path: string): Promise<UpdateFileResult>{
        const extensions = extname(file.originalname);

        const transaction = await connection.transaction();

        try {
            const existingPath = await File.findOne({
                where: { id: id},
                attributes: ['path'],
                transaction,
                raw: true,
            });

            const updateResult = await File.update(
                {   userId,
                    originName: file.originalname,
                    mimeType: file.mimetype,
                    type: extensions,
                    size: file.size,
                    path,
                    timeStamp: moment().unix(), },
                { where: { id: id }, returning: true, transaction }
            );

            await transaction.commit();
            return {existingPath, updateResult};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findFileById(id: string): Promise<RetFile>{
        return File.findOne({
            where: { id },
            attributes: ['path'],
            raw: true,
        });
    }

    async destroyFile(id: string): Promise<DeleteFileResult> {
        const transaction = await connection.transaction();

        try {
            const existingPath = await File.findOne({
                where: { id },
                attributes: ['path'],
                transaction,
                raw: true,
            });

            const deleteResult = await File.destroy(
                {where: { id }, transaction }
            );

            await transaction.commit();
            return {existingPath, deleteResult};
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

  async getAll (req): Promise<RetFiles> {
    const { limit = "10", offset = "0" } = req.params;

    try {
     return await File.findAndCountAll({
       limit: Number(limit),
       offset: Number(offset),
     });
    } catch (error) {
      throw new Error("Failed to get users.");
    }
  }

  async findFileInfoById(id: number): Promise<RetFile> {
        return File.findOne({
            where: { id },
            attributes: {
                exclude: ['id', 'userId', 'path', `timeStamp`, `revokedToken`]
            },
        });
  }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }
}

export default new FileController();
