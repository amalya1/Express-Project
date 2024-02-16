import express, {Request, Response} from 'express';
import fileManager from '../managers/fileManager';
import multer from 'multer';
import { verifyJWT } from '../middlewares/auth.middlewares/verifyJWT';
import {validateFile} from "../middlewares/validate.middlewares/validation.middlewares";
import {uploadFileSchema} from "../middlewares/validate.middlewares/validation";

const router = express.Router();
const upload = multer();



router.post('/upload', verifyJWT, upload.single('file'),
    validateFile(uploadFileSchema), async  (req: Request, res: Response) => {
        try {
        await fileManager.uploadFile(req.file, req.userId);
        res.sendStatus(200);
    } catch (error) {
        res.json(error);
    }
})


router.put('/update/:fileId', verifyJWT, upload.single('file'), validateFile(uploadFileSchema),
    async  (req: Request, res: Response) => {
        const {fileId} = req.params;
    try {
        await fileManager.updateFile(req.file, fileId, req.userId);
        res.sendStatus(200);
    } catch (error) {
        res.json(error);
    }
})


router.delete('/:fileId', verifyJWT, async (req: Request, res: Response) => {
    const {fileId} = req.params;
    try {
        await fileManager.deleteFile(fileId);
        res.sendStatus(200);
    } catch (error) {
        res.json(error);
    }
});


router.get('/download/:fileId', verifyJWT, async  (req: Request, res: Response) => {
    const {fileId} = req.params;
    try {
        await fileManager.downloadFile(fileId, res);
    } catch (error) {
        res.json(error);
}
})


router.get('/', verifyJWT, async (req: Request, res: Response) => {
    try {
        const result = await fileManager.getFiles(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.json(error);
    }
});


router.get('/:fileId', verifyJWT, async (req: Request, res: Response) => {
    const {fileId} = req.params;
    try {
        const result = await fileManager.getFile(fileId);
        res.download(result.path, result.originName);
    } catch (error) {
        res.json(error);
    }
})

export default router;