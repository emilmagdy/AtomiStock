import prisma from '../generated/prisma/client.js'
import bcrypt from 'bcrypt'
export const userRegistration = async (req, res) => {
    const { name, email, password } = req.body
    // check if the user exists in the db
    const userExists = await prisma.user.findUnique({
        where: { email: email }
    })
    if (user) {
        return res.json({ "message": "this email is already registered please login" })
    }
    return res.json({ "message": "still not finished" })
}

export const userLogin = (req, res) => {
    return res.json({ "message": "This is the login route" })
}

export const userLogout = (req, res) => {
    return res.json({ "message": "This is the logout route" })
}

