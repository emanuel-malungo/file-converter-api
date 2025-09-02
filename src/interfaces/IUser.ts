import type IRequest from './IRequest';

export default interface IUser {
  id: number;
  email: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
  requests: IRequest[];
}
