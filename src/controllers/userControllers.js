import { prisma } from '../utils/prisma.js'
import bcrypt from 'bcrypt'

export const userRegistration = async (req, res) => {
    try {
        // Get the user inputs from the request body
        const { name, email, password } = req.body
        console.log(name, email, password)

        // Validate that all required feilds are present
        if (!name || !email || !password) {
            return res.json({ message: "Some required feilds are missing" })
        }

        // Formate the email to lowercase and trim all spaces
        const formattedEmail = email.trim().toLowerCase()
        console.log(formattedEmail)

        // Check if the user exists in the db
        const userExists = await prisma.user.findUnique({
            where: {
                email: formattedEmail
            }
        })
        console.log(userExists)
        if (userExists) {
            return res.json({ message: "This email is already registered , Please login" })
        }
        // hasshing the password and addding the user to the db
        const passwordHash = await bcrypt.hash(password, 10)
        console.log(`hashed password ${passwordHash}`)
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
        return res.status(500).json({ message: err.message })
    }
}


export const userLogin = (req, res) => {
    return res.json({ "message": "This is the login route" })
}

export const userLogout = (req, res) => {
    return res.json({ "message": "This is the logout route" })
}

