import { Request } from 'express';
import { IUser, UserRole } from '../models/User';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

