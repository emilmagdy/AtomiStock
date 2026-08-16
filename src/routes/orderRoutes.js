import express from 'express'
import { createOrdersController, getAllCustomerOrders, getOrderById } from '../controllers/orderController.js'
import { tokenVerification } from '../middleware/authMiddleware.js'
const router = express.Router()

router.use(tokenVerification)

router.get("/", getAllCustomerOrders)

router.post("/", createOrdersController)

router.get("/:id", getOrderById)


export default router