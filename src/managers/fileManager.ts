import controller from "../controllers/fileController";
import { AppError } from '../common/errors';
import {Request, Response} from "express";
import fs from "fs";
import path from "path";
import {Readable} from "stream";
import crypto from "crypto";
import Buffer from "buffer";
import {RetFile} from "../common/types";


class FileManager {
  constructor() {
    this.uploadFile = this.uploadFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.getFile = this.getFile.bind(this);
  }

  async uploadFile(req, res: Response): Promise<Response> {
        const userId = req.userId;
        const file = req.file;
        const fileBuffer: Buffer = file.buffer;
        const originName = file.originalname;

        const uploadFolderPath = './upload';
        const randomName = crypto.randomBytes(4).toString('hex');
        const filePath = path.join(uploadFolderPath, `${randomName}${originName}`);


        if (!fs.existsSync(uploadFolderPath)) {
            fs.mkdirSync(uploadFolderPath);
        }

        await this.createAndWriteStream(fileBuffer, filePath);

        if (fs.existsSync(filePath)) {
            await controller.createFile(userId, file, filePath);
            return res.status(201).json({ message: AppError.FILE_CREATED });
        } else {
            return res.status(500).json({ message: AppError.FILE_WRITE_ERROR });
        }
  }

  async updateFile(req, res: Response): Promise<Response>{
        const userId = req.userId;
        const id = req.params.id;
        const file = req.file;
        const fileBuffer = file.buffer;
        const originName = file.originalname;
        const uploadFolderPath = './upload';

        const randomName = crypto.randomBytes(4).toString('hex');
        const filePath = path.join(uploadFolderPath, `${randomName}${originName}`);

        const result = await controller.updateFile(id, userId, file, filePath);
        if (result.updateResult[0] > 0) {
            await this.createAndWriteStream(fileBuffer, filePath);
            if (fs.existsSync(filePath)) {
                fs.unlink(result.existingPath.path, (err) => {
                    if (err) {
                        res.status(500).json({ message: AppError.ERROR_DELETE_FILE });
                    } else {
                        return res.status(201).json({ message: AppError.FILE_UPDATED });
                    }
                });
            } else {
                return res.status(500).json({ message: AppError.FILE_WRITE_ERROR });
            }
        }else {
            res.status(505).json({ message: AppError.ERROR_UPDATE_FILE });
        }
  }

  async deleteFile(req, res: Response): Promise<Response> {
      const id = req.params.id;

      const result = await controller.destroyFile(id);
      if (result.deleteResult) {
          fs.unlink(result.existingPath.path, (err) => {
              if (err) {
                  return res.status(500).json({message: AppError.ERROR_DELETE_FILE});
              } else {
                  return res.status(201).json({message: AppError.FILE_DELETED});
              }
          });
      } else {
          return res.status(505).json({message: AppError.ERROR_DELETE_FILE});
      }
  }

  async downloadFile(req: Request, res: Response): Promise<Response> {
      const id = req.params.id;
      const file = await controller.findFileById(id);
      if (!file) {
          return res.status(404).json({message: AppError.FILE_NOT_FOUND});
      }

      if (fs.existsSync(file.path)) {
          const fileStream = fs.createReadStream(file.path);

          const filename = path.basename(file.path);
          const encodedFilename = encodeURIComponent(filename);
          res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);

          fileStream.pipe(res);
      } else {
          return res.status(404).json({message: AppError.FILE_NOT_FOUND});
      }
  }

  async getFiles(req: Request, res: Response): Promise<RetFile[] | void | string> {
        const result = await controller.getAll(req);

        const filesArray = result.rows.map(file => file.dataValues);

        res.setHeader('Content-Type', 'application/json');
        res.write('[');

        const promises = filesArray.map(async (entry, index) => {
            const {
                path: filePath,
                originName, mimeType, type, size
            } = entry;

            if (fs.existsSync(filePath)) {
                const fileContent = await this.readFileAsync(filePath);

                const fileObj = {
                    originName, mimeType, type, size,
                    content: fileContent
                };

                if (index > 0) {
                    res.write(',');
                }
                res.write(JSON.stringify(fileObj));
            }
        });

        await Promise.all(promises);

        res.write(']');
        res.end();
  }

  async getFile(req, res: Response): Promise<Response> {
        const id = req.params.id;
        const { originName, mimeType, type, size } = await controller.findFileInfoById(id);
        const fileInfo = [
            originName,
            mimeType,
            type,
            size
        ]
        return res.status(200).json(fileInfo );
  }

  async createAndWriteStream(fileBuffer: Buffer , path: string): Promise<void> {
          return new Promise<void>((resolve, reject) => {

              const fileStream = new Readable();
              fileStream.push(fileBuffer);
              fileStream.push(null);

              const writeStream = fs.createWriteStream(path);

              fileStream.pipe(writeStream);

              fileStream.on('data', (chunk) => {
                  writeStream.write(chunk);
              });

              fileStream.on('end', () => {
                  writeStream.end();
              });

              writeStream.on('finish', () => {
                  resolve();
              });

              fileStream.on('error', reject);
              writeStream.on('error', reject);

          });
  }

  async readFileAsync(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
  }
}

export default new FileManager();
