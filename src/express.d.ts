import { JwtPayload } from "jsonwebtoken";

export interface CustomJwtPayload extends JwtPayload {
    id: number
    role: string
}

declare global {
    namespace Express {
        interface Request {
            user?: CustomJwtPayload
        }
    }
}