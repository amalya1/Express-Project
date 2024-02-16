import * as joi from 'joi';
import { Token, UserData } from '../../common/types';


export const createUserSchema = joi.object<UserData>({
  userName: joi.alternatives()
      .try(
          joi.string()
              .lowercase()
              .email()
              .trim(),
          joi.string()
              .trim()
              .regex(/^\+[1-9]\d{1,14}$/)
      )
      .required(),
  password: joi.string().min(6).required(),

});


export const loginSchema = joi.object<UserData>({
  userName: joi.alternatives()
      .try(
          joi.string()
              .lowercase()
              .email()
              .trim(),
          joi.string()
              .trim()
              .regex(/^\+[1-9]\d{1,14}$/)
      )
      .required(),
  password: joi.string().required(),
});


export const tokenSchema = joi.object<Token>({
    token: joi.string().required(),
});


export const uploadFileSchema = joi.object({
    mimetype: joi.string().valid('image/jpeg').required().messages({
        'any.only': 'Only JPEG files are allowed!'
    }),
});