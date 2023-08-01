import * as joi from 'joi';
import {GetAllRequestParams, UserData, UserLogin} from './types';

export const createUserSchema = joi.object<UserData>({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  password: joi.string().min(6).required(),
  email: joi.string().lowercase().email().required(),
});

export const loginInputSchema = joi.object<UserLogin>({
  email: joi.string().email().required().trim(),
  password: joi.string().required(),
});

export const getAllRequestSchema = joi.object<GetAllRequestParams>({
  limit: joi.number().integer().min(0).default(100),
  offset: joi.number().integer().min(0).default(0),
});
