import express from 'express'
import { tokenVerification, roleAutherization } from '../middleware/authMiddleware.js'
import {
    getProductsController,
    addProductController,
    getProductController,
    editProductController,
    deleteProductController
} from '../controllers/productControllers.js'

const router = express.Router()

router.get("/",
    getProductsController)

router.get("/:id",
    getProductController)

router.post("/add",
    tokenVerification,
    roleAutherization("ADMIN"),
    addProductController)

router.patch("/:id",
    tokenVerification,
    roleAutherization("ADMIN"),
    editProductController
)

router.delete("/:id",
    tokenVerification,
    roleAutherization("ADMIN"),
    deleteProductController
)

export default router