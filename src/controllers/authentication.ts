import express from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { authentication, random } from '../helpers';
import { INextFunction } from '../interfaces/next';

/**
 * * TODO: Validação do email com api
 * * TODO: Melhores respostas
 * TODO: Documentação das funções
 */
async function register(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const { email, password, username} = request.body;
    if (!email || !password || !username) {
      next({ statusCode: 400, messageCode: 'invalidData' });
    }

    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+)(\.[^<>()\[\]\\.,;:\s@"]+)*)@(([^<>()\[\]\\.,;:\s@"]+)(\.[^<>()\[\]\\.,;:\s@"]+)*)$/;
    if (!emailRegex.test(email)) {
      next({ statusCode: 400, messageCode: 'authentication.invalidEmail' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      next({ statusCode: 400, messageCode: 'authentication.emailInUse' });
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

async function login(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      next({ statusCode: 400, messageCode: 'invalidData' });
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
    if (!user) {
      next({ statusCode: 400, messageCode: 'authentication.emailNotFound' });
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (user.authentication.password !== expectedHash) {
      next({ statusCode: 403, messageCode: 'authentication.wrongCredentials' });
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
