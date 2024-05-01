import express from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { authentication, random } from '../helpers';

/**
 * * TODO: Validação do email com api
 * TODO: Melhores respostas
 * TODO: Documentação das funções
 */
async function register(request: express.Request, response: express.Response) {
  try {
    const { email, password, username} = request.body;
    if (!email || !password || !username) {
      return response.sendStatus(400);
    }

    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+)(\.[^<>()\[\]\\.,;:\s@"]+)*)@(([^<>()\[\]\\.,;:\s@"]+)(\.[^<>()\[\]\\.,;:\s@"]+)*)$/;
    if (!emailRegex.test(email)) {
      return response.status(400).json({ message: 'O email informado não é válido. Por favor, corrija o email e tente novamente.' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return response.status(400).json({ message: 'O email informado já está cadastrado. Por favor, tente se registrar com um email diferente.' });
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
    console.log(error);
    return response.status(500).json({ message: 'Erro ao processar o registro. Por favor, tente novamente mais tarde.' });
  }
}

async function login(request: express.Request, response: express.Response) {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.sendStatus(400);
    }

    const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');
    if (!user) {
      return response.sendStatus(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (user.authentication.password !== expectedHash) {
      return response.sendStatus(403);
    }

    const salt = random();
    user.authentication.sessionToken = authentication(salt, user._id.toString());
    await user.save();

    response.cookie('THINAS-AUTH', user.authentication.sessionToken, { domain: 'localhost', path: '/' });

    return response.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return response.sendStatus(400);
  }
}

export { login, register };
