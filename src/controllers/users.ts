import express from 'express';
import { get } from 'lodash';
import { deleteUserById, getUserById, getUsers } from '../db/users';
import { INextFunction } from '../interfaces/next';

async function getAllUsers(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const users = await getUsers();

    const currentUserId = get(request, 'identity._id', '');
    const formattedUsers = users.map((user) => {
      const userModel = {
        '_id': user._id,
        'username': user.username,
        'email': user.email,
        '__v': user.__v,
      };

      if (user._id.toString() === currentUserId.toString()) {
        return { ...userModel, isLogged: true }
      }

      return { ...userModel };
    });

    return response.status(200).json(formattedUsers);
  } catch (error) {
    next(error);
  }
}

async function deleteUser(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const { id } = request.params;
    const deletedUser = await deleteUserById(id);

    return response.json(deletedUser);
  } catch (error) {
    next(error);
  }
}

async function updateUser(request: express.Request, response: express.Response, next: INextFunction) {
  try {
    const { id } = request.params;
    const { username } = request.body;
    if (!username) {
      return next({ statusCode: 400, messageCode: 'authentication.emailNotFound' })
    }

    const user = await getUserById(id);
    user.username = username;
    await user.save();

    return response.status(200).json(user).end();
  } catch (error) {
    next(error);
  }
}

export {
  getAllUsers,
  deleteUser,
  updateUser,
};
