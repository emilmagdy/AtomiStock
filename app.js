require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const userRoutes = require('./src/routes/userRoutes')

app.use(express.json())
app.use("/user", userRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})