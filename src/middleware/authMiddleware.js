import jwt from 'jsonwebtoken'

export const tokenVerification = (req, res, next) => {
    //Get the authorization header from the req headers
    const authHeader = req.headers['authorization']

    // If no autherization header return unautherized res
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    // Get the exact token string from the header
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid autherization header format" })
    }
    const token = authHeader.split(" ")[1]
    if (!token) {
        return res.status(401).json({ message: "no token found" })
    }

    // Verify the token and return the user boject and attach it to the req

    try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decodedUser
        return next()
    } catch (err) {
        console.log(err.message)
        return res.status(403).json({ message: "Forbidden" })
    }
}