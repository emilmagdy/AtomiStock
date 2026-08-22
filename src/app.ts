import 'dotenv/config'

import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import stockBatchedRoutes from './routes/stockBatchesRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

app.use(express.json())
app.use("/users", userRoutes)
app.use("/products", productRoutes)
app.use("/stock-batches", stockBatchedRoutes)
app.use("/orders", orderRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})