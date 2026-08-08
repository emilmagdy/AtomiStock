import { prisma } from '../utils/prisma.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const userRegistration = async (req, res) => {
    try {
        // Get the user inputs from the request body
        const { name, email, password } = req.body

        // Validate that all required feilds are present
        if (!name ||
            typeof name !== "string" ||
            !email ||
            typeof email !== "string" ||
            !password ||
            typeof password !== "string") {
            return res.status(400).json({ message: "Some required feilds are missing" })
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
            return res.status(409).json({ message: "This email is already registered , Please login" })
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
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const userLogin = async (req, res) => {
    try {
        // Get the user inputs from the request body
        const { email, password } = req.body

        // Validate that all required feilds are present
        if (!email ||
            typeof email !== "string" ||
            !password ||
            typeof password !== "string") {
            return res.status(400).json({ message: "Some required feilds are missing" })
        }
        // Formate the email to lowercase and trim all spaces
        const formattedEmail = email.trim().toLowerCase()

        // Check if the email is registered
        const user = await prisma.user.findUnique({
            where: { email: formattedEmail }
        })
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Check if the password is correct
        const correctPassword = await bcrypt.compare(password, user.passwordHash)
        if (correctPassword === false) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Generate the jwt
        const payload = {
            id: user.id,
            role: user.role
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
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
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "internal server error" })
    }
}

export const userLogout = (req, res) => {
    return res.status(200).json({ message: "Logged out successfully" })
}

export const userProfile = async (req, res) => {
    try {
        //Get the user id from the req.user
        if (!req.user?.id) {
            return res.status(404).json({ message: "Not found" })
        }
        const user_id = req.user.id
        //Get the user and  Check if the user is not deleted 
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        })
        if (!user) {
            return res.status(404).json({ message: "Not Found" })
        }
        user.passwordHash = undefined
        return res.status(200).json({
            user
        })
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Internal server error" })
    }
}

