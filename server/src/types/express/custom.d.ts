export {}

import { Username } from "../custom";

declare global {
  namespace Express {
    export interface Request {
      username: string
    }
  }
}