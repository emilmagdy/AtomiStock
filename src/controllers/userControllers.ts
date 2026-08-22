import prisma from '../utils/prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AppError from '../utils/AppError.js'
import type { Request, Response } from 'express'

export const userRegistration = async (req: Request, res: Response) => {
    // Get the user inputs from the request body
    const { name, email, password } = req.body

    // Validate that all required feilds are present
    if (!name ||
        typeof name !== "string" ||
        !email ||
        typeof email !== "string" ||
        !password ||
        typeof password !== "string") {
        throw new AppError("Some required feilds are missing", 400)
    }

    // Formate the email to lowercase and trim all spaces
    const formattedEmail = email.trim().toLowerCase()

    // Check if the user exists in the db
    const userExists = await prisma.user.findUnique({
        where: {
            email: formattedEmail
        }
    })
    if (userExists) {
        throw new AppError("This email is already registered , Please login", 409)
    }

    // hasshing the password and addding the user to the db
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
        data: {
            name,
            email: formattedEmail,
            passwordHash
        }, select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    })
    return res.status(201).json({
        message: "registerd successfully",
        user: newUser
    }
    )
}


export const userLogin = async (req: Request, res: Response) => {
    // Get the user inputs from the request body
    const { email, password } = req.body

    // Validate that all required feilds are present
    if (!email ||
        typeof email !== "string" ||
        !password ||
        typeof password !== "string") {
        throw new AppError("Some required feilds are missing", 400)
    }

    // Formate the email to lowercase and trim all spaces
    const formattedEmail = email.trim().toLowerCase()

    // Check if the email is registered
    const user = await prisma.user.findUnique({
        where: { email: formattedEmail }
    })
    if (!user) {
        throw new AppError("Invalid email or password", 401)
    }

    // Check if the password is correct
    const correctPassword = await bcrypt.compare(password, user.passwordHash)
    if (correctPassword === false) {
        throw new AppError("Invalid email or password", 401)
    }

    // Generate the jwt
    const payload = {
        id: user.id,
        role: user.role
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
    )

    return res.status(200).json({
        message: "Login successsful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }
    })
}

export const userLogout = (req: Request, res: Response) => {
    return res.status(200).json({ message: "Logged out successfully" })
}

export const userProfile = async (req: Request, res: Response) => {
    //Get the user id from the req.user
    if (!req.user?.id) {
        throw new AppError("Authentication required", 401)
    }
    const user_id = req.user.id

    //Get the user and  Check if the user is not deleted 
    const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    })
    if (!user) {
        throw new AppError("User Not Found", 404)
    }
    return res.status(200).json({
        user
    })
}

