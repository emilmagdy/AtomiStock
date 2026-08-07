import {prisma} from '../utils/prisma.js'

import bcrypt from 'bcrypt'

export const userRegistration = async (req, res) => {
    try{
        
    const { name, email, password } = req.body
    // check if the user exists in the db
    //if (userExists) {
        //return res.json({ "message": "this email is already registered please login" })
    //}
    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash : password,
            role : "customer"
        }
    })
    return res.json({ "message": "still not finished" })
}   catch (err) {
    console.log(err)
return res.status(500).json({"error":"error occured"})
}}

export const userLogin = (req, res) => {
    return res.json({ "message": "This is the login route" })
}

export const userLogout = (req, res) => {
    return res.json({ "message": "This is the logout route" })
}

