import express from 'express';
const router = express.Router();
import { addStockBatchController, deleteStockBatchController, getALLStockBatchesController, getStockBatchesForProductController } from '../controllers/stockBatchesControllers.js';
router.post("/", addStockBatchController);
router.delete("/:id", deleteStockBatchController);
router.get("/product/:productId", getStockBatchesForProductController);
router.get("/", getALLStockBatchesController);
export default router;
