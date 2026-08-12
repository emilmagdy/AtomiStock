import prisma from '../utils/prisma.js'
import AppError from '../utils/AppError.js'

export const addStockBatchController = async (req, res) => {
    // get hte data of the stockbatch  to be added
    const productId = Number(req.body.productId)
    const quantity = Number(req.body.quantity)

    if (isNaN(productId) || isNaN(quantity) || quantity < 0 || Number.isInteger(quantity)) {
        throw new AppError("Product id and quantity must be a number", 400)
    }

    // Create a prisma transaction to  handle the atomic operation of the stock addition
    const result = await prisma.$transaction(async (tx) => {


        // Add the new stockBatch to the db
        const addedStockBatch = await tx.stockBatch.create({
            data: {
                productId,
                quantity
            }
        })

        // Add the product quantity by the quantity added
        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: {
                stockQuantity: { increment: quantity }
            }
        })
        return { addedStockBatch, updatedProduct }
    })

    // Make the response with OK status and tha  added batch object
    return res.status(201).json({
        message: "Batch added successfully",
        batch: result.addedStockBatch,
        totalStockQuantity: result.updatedProduct.stockQuantity
    })
}

export const deleteStockBatchController = async (req, res) => {
    // Get the batch is for the batch to be dleted from the URL
    const stockBatchId = Number(req.params.id)

    // Validate that the stockbatch id passed into the URL is a number
    if (isNaN(stockBatchId) || stockBatchId < 0) {
        throw new AppError("invalid stockBatch id parameter in the URL", 400)
    }

    const batchExists = await prisma.stockBatch.findUnique({
        where: { id: stockBatchId }
    })
    if (!batchExists) {
        throw new AppError('Batch does not exist', 404)
    }

    // Create a prisma transaction to  handle the atomic operation of the stock deduction
    const result = await prisma.$transaction(async (tx) => {
        // Delete the record from the db
        const deletedBatch = await tx.stockBatch.delete({
            where: { id: stockBatchId }
        })
        // deduct the quantity of the product in that batch from the total stock
        const updatedProduct = await tx.product.update({
            where: { id: batchExists.productId },
            data: {
                stockQuantity: { decrement: batchExists.quantity }
            }
        })
        return { deletedBatch, updatedProduct }
    })

    // Make the response with status OK and the dellted batch object
    return res.status(200).json({
        message: "Batch delted Seccussfuly",
        batch: result.deletedBatch,
        totalStockQuantity: result.updatedProduct.stockQuantity
    })
}

export const getALLStockBatchesController = async (req, res) => {
    // Get all stock batches 
    const allBatches = await prisma.stockBatch.findMany()

    // Return the response with the an array of all the stock batches
    return res.status(200).json({
        message: "All stock batches",
        stockBatches: allBatches
    })
}

export const getStockBatchesForProductController = async (req, res) => {
    // Get the product id from the URL
    const productId = Number(req.params.productId)

    // Validate that the product in the url is a number
    if (!productId || isNaN(productId)) {
        throw new AppError("Invalid product id parameter in the URL", 400)
    }

    // Get the product record form the db to return ts details in the response
    const selectedProduct = await prisma.product.findUnique({
        where: { id: productId }
    })
    if (!selectedProduct) {
        throw new AppError("Product is not found or deleted", 404)
    }

    // get all batches for certain product from the db
    const batchesForProduct = await prisma.stockBatch.findMany({
        where: { productId: productId }
    })

    return res.status(200).json({
        message: `All batches for ${selectedProduct.name} `,
        batches: batchesForProduct
    })
}