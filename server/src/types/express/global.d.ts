export {}

import { Username, userToken } from "../custom";

declare global {
  namespace Express {
    export interface Request {
      user?: userToken
    }
  }
}