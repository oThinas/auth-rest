import express from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { authentication, random } from '../helpers';
import { INextFunction } from '../interfaces/next';

/**
 * Registra um novo usuário.
 * 
 * @param {express.Request} request - Objeto da requisição HTTP contendo os dados do usuário.
 * @param {express.Response} response - Objeto da resposta HTTP.
 * @param {express.NextFunction} next - Função de middleware para lidar com erros.
 * 
 * @throws {IError} - Lança um erro caso a criação do usuário falhe.
 * 
 * @returns Usuário criado.
 */
async function register(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const { email, password, username} = request.body;
    if (!email || !password || !username) {
      return next({ statusCode: 400, messageCode: 'invalidData' });
    }

    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+)(\.[^<>()\[\]\\.,;:\s@"]+)*)@(([^<>()\[\]\\.,;:\s@"]+)(\.[^<>()\[\]\\.,;:\s@"]+)*)$/;
    if (!emailRegex.test(email)) {
      return next({ statusCode: 400, messageCode: 'authentication.invalidEmail' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return next({ statusCode: 400, messageCode: 'authentication.emailInUse' });
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return response.status(200).json(user).end();
  } catch (error) {
    next(error);
  }
}

/**
 * Loga um usuário.
 * 
 * @param {express.Request} request - Objeto da requisição HTTP contendo os dados do usuário.
 * @param {express.Response} response - Objeto da resposta HTTP.
 * @param {express.NextFunction} next - Função de middleware para lidar com erros.
 * 
 * @throws {IError} - Lança um erro caso a criação do usuário falhe.
 * 
 * @returns Usuário logado.
 */
async function login(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return next({ statusCode: 400, messageCode: 'invalidData' });
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
    if (!user) {
      return next({ statusCode: 400, messageCode: 'authentication.emailNotFound' });
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (user.authentication.password !== expectedHash) {
      return next({ statusCode: 403, messageCode: 'authentication.wrongCredentials' });
    }

    const salt = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());
    await user.save();

    response.cookie('THINAS-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

    return response.status(200).json(user).end();
  } catch (error) {
    next(error);
  }
}

export { login, register };
