export const errorHandler = (err, req, res, next) => {
    console.log(`Error: ${err.message}`)
    switch (err.code) {
        case "P2002": {
            return res.status(409).json({ message: "A record with the same field exists" })
        }
        case "P2025": {
            return res.status(404).json({ message: "That record is not found" })
        }
        default: {
            const statusCode = err.status || err.statusCode || 500
            return res.status(statusCode).json({
                message: err.message || "Internal server error"
            })
        }
    }
}