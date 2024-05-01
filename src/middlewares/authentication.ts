import express from 'express';
import { get, merge } from 'lodash';
import { getUserBySessionToken } from '../db/users';
import { INextFunction } from '../interfaces/next';

async function isOwner(request: express.Request, _: express.Response, next: INextFunction) {
  try {
    const { id } = request.params;
    const currentUserId = get(request, 'identity._id') as string;
    if (!currentUserId) {
      return next({ statusCode: 401, messageCode: 'authentication.unauthenticated' });
    }

    if (currentUserId.toString() !== id) {
      return next({ statusCode: 403, messageCode: 'authentication.unauthorized' });
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function isAuthenticated(request: express.Request, _: express.Response, next: express.NextFunction) {
  try {
    const sessionToken = request.cookies['THINAS-AUTH'];
    if (!sessionToken) {
      return next({ statusCode: 401, messageCode: 'authentication.unauthenticated' });
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return next({ statusCode: 401, messageCode: 'authentication.unauthenticated' });
    }

    merge(request, { identity: existingUser });

    return next();
  } catch (error) {
    next(error);
  }
}

export { isAuthenticated, isOwner }
