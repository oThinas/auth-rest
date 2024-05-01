import express from 'express';
import { deleteUser, getAllUsers, updateUser } from '../controllers/users';
import { isAuthenticated, isOwner } from '../middlewares/authentication'

export default (router: express.Router) => {
  router.get('/users', isAuthenticated, getAllUsers)
    .delete('/users/:id', isAuthenticated, isOwner, deleteUser)
    .patch('/users/:id', isAuthenticated, isOwner, updateUser);
}
