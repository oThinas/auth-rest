import express from 'express';
import { IError } from '../interfaces/error';
import { errorMessages } from '../config/errorMessages';

export function errorHandler(error: IError, _: express.Request, response: express.Response, __: express.NextFunction) {
  const { messageCode, statusCode } = error;
  const message = getErrorMessage(error);

  return response.status(error.statusCode || 500).json({
    error: {
      statusCode,
      messageCode,
      message,
    }
  }).end();
}

function getErrorMessage(error: IError) {
  const { customMessage, messageCode } = error;
  
  if (customMessage) {
    return customMessage;
  }

  const messageParts = messageCode.split('.');
  let errorMessageObject: any = errorMessages;

  for (const part of messageParts) {
    if (!errorMessageObject[part]) {
      return undefined;
    }

    errorMessageObject = errorMessageObject[part];
  }

  return errorMessageObject as string;
}
