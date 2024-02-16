import { Request, Response, NextFunction } from 'express';
import * as joi from 'joi';


export const validateData = (schema: joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value: validatedData } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        req.body = validatedData;
        next();
    };
};


export const validateFile = (schema: joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.params) {
            return res.status(400).json({ error: 'File is required' });
        }

        const { error } = schema.validate({ mimetype: req.file.mimetype });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        next();
    };
};