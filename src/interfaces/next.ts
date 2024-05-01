import { IError } from './error';

export interface INextFunction {
  (err?: IError): void;
}