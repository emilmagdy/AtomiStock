import express from 'espress'
const router = express.route()
import {
    addStockBatchController,
    deleteStockBatchController,
    getALLStockBatchesController,
    getStockBatchesForProductController
} from '../controllers/stockBatchesControllers'

router.post("/add", addStockBatchController)

router.delete("/:id", deleteStockBatchController)

router.get("/product/:productId", getStockBatchesForProductController)

router.get("/", getALLStockBatchesController)

export default router
