import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email?: string;
    currency?: string | null;
  };
}
