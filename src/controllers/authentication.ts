import { createUser, getUserByEmail } from '../db/users';
import express from 'express';
import { authentication, random } from '../helpers';

export async function register(request: express.Request, response: express.Response) {
  try {
    const { email, password, username} = request.body;
    if (!email || !password || !username) {
      return response.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return response.sendStatus(400);
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
  } catch(error) {
    console.log(error);
    return response.sendStatus(400);
  }
}
