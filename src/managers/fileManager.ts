import controller from "../controllers/fileController";
import { AppError } from '../common/errors';
import {Response} from "express";
import fs from "fs";
import path from "path";
import {Readable} from "stream";
import crypto from "crypto";
import Buffer from "buffer";
import {RetFile, RetFiles} from "../common/types";


class FileManager {
  constructor() {
    this.uploadFile = this.uploadFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.getFile = this.getFile.bind(this);
  }


  async uploadFile(file: Express.Multer.File, userId: number): Promise<void> {
        const fileBuffer: Buffer = file.buffer;
        const originName = file.originalname;

        const uploadFolderPath = './upload';
        const randomName = crypto.randomBytes(4).toString('hex');
        const filePath = path.join(uploadFolderPath, `${randomName}${originName}`);


        if (!fs.existsSync(uploadFolderPath)) {
            fs.mkdirSync(uploadFolderPath);
        }

        await this.createAndWriteStream(fileBuffer, filePath);

        if (!fs.existsSync(filePath)) throw { message: AppError.FILE_WRITE_ERROR, statusCode: 400 };

        await controller.createFile(userId, file, filePath);
  }


  async updateFile(file: Express.Multer.File, fileId: string, userId: number): Promise<void> {
      const randomName = crypto.randomBytes(4).toString('hex');
      const filePath = path.join('./upload', `${randomName}${file.originalname}`);

      const existedFile = await controller.findFileById(fileId);
      if(!existedFile) throw { message: AppError.FILE_NOT_FOUND, statusCode: 404 };

      await controller.updateFile(fileId, userId, file, filePath);
      await this.createAndWriteStream(file.buffer, filePath);

      if (fs.existsSync(filePath)) {
          fs.unlink(existedFile.path, (err) => {
              if (err) throw { message: AppError.ERROR_DELETE_FILE, statusCode: 500 };
          });
      } else {
          throw { message: AppError.ERROR_UPDATE_FILE, statusCode: 500 };
      }
  }


  async deleteFile(fileId: string): Promise<void> {
      const file = await controller.findFileById(fileId);
      if(!file) throw { message: AppError.FILE_NOT_FOUND, statusCode: 404 };

      await controller.destroyFile(fileId);
      fs.unlink(file.path, (err) => {
          if (err) throw { message: AppError.ERROR_DELETE_FILE, statusCode: 500 };
      });
  }


  async downloadFile(fileId: string, res: Response): Promise<void> {
      const file = await controller.findFileById(fileId);
      if (!file) throw {message: AppError.FILE_NOT_FOUND, statusCode: 404};

      if (fs.existsSync(file.path)) {
          const fileStream = fs.createReadStream(file.path);
          res.setHeader('Content-Disposition', `filename="${file.originName}"`);
          fileStream.pipe(res);
          fileStream.on('end', () => {
              fileStream.close();
          });
      } else {
          throw {message: AppError.FILE_NOT_FOUND, statusCode: 404};
      }
  }


    async getFiles(input): Promise<RetFiles> {
        const files = await controller.getAll(input);
        if (files.rows.length == 0) throw {message: AppError.FILE_NOT_FOUND, statusCode: 404};
        return files;
    }


    async getFile(fileId: string): Promise<RetFile> {
      const file = await controller.findFileById(fileId);
      if(!file) throw { message: AppError.FILE_NOT_FOUND, statusCode: 404 };
      return file;
    }


  async createAndWriteStream(fileBuffer: Buffer , path: string): Promise<void> {
          return new Promise<void>((resolve, reject) => {

              const readStream = new Readable();
              readStream.push(fileBuffer);
              readStream.push(null);

              const writeStream = fs.createWriteStream(path);

              readStream.pipe(writeStream);

              readStream.on('data', (chunk) => {
                  writeStream.write(chunk);
              });

              readStream.on('end', () => {
                  writeStream.end();
              });

              writeStream.on('finish', () => {
                  resolve();
              });

              readStream.on('error', reject);
              writeStream.on('error', reject);

          });
  }
}

export default new FileManager();
