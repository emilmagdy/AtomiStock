import 'dotenv/config'

import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000
import userRoutes from './src/routes/userRoutes.js'
import productRoutes from './src/routes/productRoutes.js'
import { errorHandler } from './src/middleware/errorHandler.js'

app.use(express.json())
app.use("/users", userRoutes)
app.use("/products", productRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})