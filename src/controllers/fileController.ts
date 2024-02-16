import moment from 'moment';
import File from "../models/file";
import {extname} from "path";
import {RetFile, RetFiles} from "../common/types";


class FileController {
    constructor() {
        this.createFile = this.createFile.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.findFileById = this.findFileById.bind(this);
        this.destroyFile = this.destroyFile.bind(this);
        this.getAll = this.getAll.bind(this);
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


    async updateFile(id: string, userId: number, file: Express.Multer.File, path: string): Promise<void> {
        const extensions = extname(file.originalname);

        await File.update(
            {
                userId,
                originName: file.originalname,
                mimeType: file.mimetype,
                type: extensions,
                size: file.size,
                path,
                timeStamp: moment().unix(),
            },
            {where: { id: id }, returning: true}
        );
    }


    async findFileById(id: string): Promise<RetFile> {
        return File.findOne({
            rejectOnEmpty: undefined,
            where: {id},
            raw: true
        });
    }


    async destroyFile(id: string): Promise<void> {
        await File.destroy({ where: {id} });
    }


    async getAll(input): Promise<RetFiles> {
        const { limit = 10, offset = 0 } = input;
        return await File.findAndCountAll({
            limit: limit,
            offset: offset
        });
    }
}

export default new FileController();
