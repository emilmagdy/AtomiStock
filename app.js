import 'dotenv/config'

import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000
import userRoutes from './src/routes/userRoutes.js'

app.use(express.json())
app.use("/users", userRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})