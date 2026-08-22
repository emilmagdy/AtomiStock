import type { Request, Response, NextFunction } from "express"
import AppError from "../utils/AppError.js"

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        console.log(err.message)
        return res.status(err.statusCode).json({
            message: err.message
        })
    }
    if (err instanceof Error) {
        console.error("Unhandeled standard error", err)
        return res.status(500).json({
            message: err.message
        })
    }
    return res.status(500).json({
        message: "Unexpected internal server error occured"
    })
}