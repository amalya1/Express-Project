import * as joi from 'joi';
import { Token, UserData, UserLogin } from '../common/types';

export const createUserSchema = joi.object<UserData>({
  password: joi.string().min(6).required(),
  userName: joi.alternatives()
      .try(
          joi.string()
              .lowercase()
              .email(),
          joi.string()
              .trim()
              .regex(/^\+[1-9]\d{1,14}$/)
      )
      .required()
});

export const loginInputSchema = joi.object<UserLogin>({
  userName: joi.alternatives()
      .try(
          joi.string()
              .email(),
          joi.string()
              .trim()
              .regex(/^\+[1-9]\d{1,14}$/)
      )
      .required(),
  password: joi.string().required(),
});

export const tokenInputSchema = joi.object<Token>({
    token: joi.string().required(),

});
