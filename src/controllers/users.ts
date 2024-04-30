import express from 'express';
import { get } from 'lodash';
import { deleteUserById, getUserById, getUsers } from '../db/users';

async function getAllUsers(request: express.Request, response: express.Response) {
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
    console.log(error);
    return response.sendStatus(400);
  }
}

async function deleteUser(request: express.Request, response: express.Response) {
  try {
    const { id } = request.params;
    const deletedUser = await deleteUserById(id);

    return response.json(deletedUser);
  } catch (error) {
    console.log(error);
    return response.sendStatus(400);
  }
}

async function updateUser(request: express.Request, response: express.Response) {
  try {
    const { id } = request.params;
    const { username } = request.body;
    if (!username) {
      return response.sendStatus(400);
    }

    const user = await getUserById(id);
    user.username = username;
    await user.save();

    return response.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return response.sendStatus(400);
  }
}

export {
  getAllUsers,
  deleteUser,
  updateUser,
};
