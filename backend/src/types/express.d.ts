import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }
}