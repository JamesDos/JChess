import allowedOrigins from "./allowedOrigins";
import { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: (origin: any, cb: any) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      cb(null, true)
    } else {
      cb(new Error("Not allowed by CORS"))
    }
  },
  optionsSuccessStatus: 200
}

export default corsOptions