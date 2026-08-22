import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'
import type { Request, Response, NextFunction } from "express"
import type { CustomJwtPayload } from '../express.d.ts'

export const tokenVerification = (req: Request, res: Response, next: NextFunction) => {
    // Get the authorization header from the req headers
    const authHeader = req.headers['authorization']

    // If no autherization header return unautherized res
    if (!authHeader) {
        throw new AppError("Unauthorized", 401)
    }

    // Get the exact token string from the header
    if (!authHeader.startsWith("Bearer ")) {
        throw new AppError("Invalid autherization header format", 401)
    }
    const token = authHeader.split(" ")[1]
    if (!token) {
        throw new AppError("No token found", 401)
    }

    // Verify the token and return the user boject and attach it to the req
    try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload
        req.user = decodedUser
        return next()
    } catch (err) {
        const error = err as Error
        if (error.name === "TokenExpiredError") {
            throw new AppError("Token Expired , Please log in ", 401)
        } else if (error.name === "JsonWebTokenError") {
            throw new AppError("Invalid or corrrupted token ", 401)
        }
        throw new AppError("Autherization failed", 401)
    }
}

export const roleAutherization = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Check that the user is autherorized  
        if (!req.user) {
            throw new AppError("Unautherized", 401)
        }

        // Verify that the user role is included in the allowed roles 
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError("Forbidden, You have no permission to access this resource", 403)
        }
        return next()
    }
}