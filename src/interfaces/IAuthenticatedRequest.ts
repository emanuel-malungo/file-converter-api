import type { Request } from "express";

export interface IAuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    apiKey: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
