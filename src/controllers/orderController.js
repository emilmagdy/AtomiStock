import prisma from '../utils/prisma.js'
import AppError from '../utils/AppError.js'
import { Prisma } from '../generated/prisma/index.js'

export const createOrdersController = async (req, res) => {
    // Get the user id from the request body
    const user = req.user
    if (!user || !user.id) {
        throw new AppError("Autherization required, please login ", 401)
    }

    // Get the array of order items from the request body
    const { items } = req.body

    // Validate that its an array and not empty
    if (!Array.isArray(items) || items.length < 1) {
        throw new AppError("At least one order item is required to create the order")
    }

    // validate the presence of all feilds of the items
    for (const item of items) {
        if (!item.productId || !item.quantity || Number(item.quantity) <= 0) {
            throw new AppError("Some required feilds of the order items are abscent", 404)
        }
    }
    // make the whole process in an atomic manner through prisma transaction
    const result = await prisma.$transaction(async (tx) => {
        // Make an array of item data objects 
        const itemsData = []
        // Create a variabke to track the total amount of the order
        let totalAmount = new Prisma.Decimal(0)
        // Get all the product ids for all items in one array
        const productIds = items.map(i => Number(i.productId))
        // fetch the products from teh db in 1 step
        const dbProducts = await tx.product.findMany({
            where: { id: { in: productIds } }
        })
        // Make a dictionary that maps the product id to the product
        const productMap = new Map(dbProducts.map(p => [p.id, p]))

        // Iterate over each item in the items array
        for (const item of items) {
            // Get the product from the products dictionary
            const productId = Number(item.productId)
            const product = productMap.get(productId)
            // Check if a product with such id exists
            if (!product) {
                throw new AppError("No product with the specified id exists", 404)
            }

            // Check if the product ordederd quantit is already in stock
            if (product.stockQuantity < item.quantity) {
                throw new AppError("Insufficient stock of the specified product", 404)
            }
            // deduct the quantity fromthe total stock of that product
            await tx.product.update({
                where: { id: productId },
                data: { stockQuantity: { decrement: item.quantity } }
            })

            // Add order item object to the order items data array
            itemsData.push({
                productId: productId,
                unitPrice: product.unitPrice,
                quantity: item.quantity
            })

            const itemAmount = product.unitPrice.mul(item.quantity)
            totalAmount = totalAmount.add(itemAmount)

            const stockBatches = await tx.stockBatch.findMany({
                where: { productId, quantity: { gt: 0 } },
                orderBy: { addedAt: "asc" }
            })

            let remainingToDeduct = item.quantity
            for (const batch of stockBatches) {
                if (remainingToDeduct <= 0) break
                if (remainingToDeduct >= batch.quantity) {
                    remainingToDeduct -= batch.quantity
                    await tx.stockBatch.delete({
                        where: { id: batch.id }
                    })
                } else {
                    await tx.stockBatch.update({
                        where: { id: batch.id },
                        data: { quantity: { decrement: remainingToDeduct } }
                    })
                    remainingToDeduct = 0
                }
            }
        }
        const order = await tx.order.create({
            data: {
                userId: user.id,
                orderItems: { create: itemsData },
                totalAmount: totalAmount
            }
        })
        return { order }
    })
    return res.status(201).json({
        message: "Order created successfully",
        order: result.order
    })
}

export const getAllCustomerOrders = async (req, res) => {
    // Get the user id from the request body
    const user = req.user
    if (!user || !user.id) {
        throw new AppError("Autherization required, please login ", 401)
    }

    // Get an array of all orders for the loged in user
    const orders = await prisma.order.findMany({
        where: { userId: user.id }
    })
    if (!orders) {
        throw new AppError("There are no orders yet", 404)
    }

    // Return the res qith OK status and the orders array 
    return res.status(200).json({
        message: "All of your oders",
        orders
    })
}

export const getOrderById = async (req, res) => {
    // Get the user id from the request body
    const user = req.user
    if (!user || !user.id) {
        throw new AppError("Autherization required, please login ", 401)
    }

    // Get the order id from the URL parameters
    const orderId = Number(req.params.id)
    if (!orderId || !typeof (orderId) === Number) {
        throw new AppError("Invalid Id prameter", 400)
    }

    // Get the details of the specified order
    // Get the order summary 
    const orderSummary = await prisma.order.findUnique({
        where: { id: orderId }
    })
    if (!orderSummary) {
        throw new AppError("No order with such ID present", 404)
    }
    console.log(`orderSummary ${orderSummary}`)

    // Get an array of all items in the specified order 
    const orderItems = await prisma.orderItem.findMany({
        where: { orderId }
    })
    console.log(`order Items : ${orderItems}`)
    const productIds = orderItems.map(i => i.productId)
    console.log(`product ids ${productIds}`)
    const orderProducts = await prisma.product.findMany({
        where: { id: { in: productIds } }
    })
    const productMap = new Map(orderProducts.map(p => [p.id, p]))
    const orderItemsDetails = []

    console.log(`product Map ${productMap}`)


    for (const item of orderItems) {
        const productId = item.productId
        console.log(`productId ${productId}`)
        const product = productMap.get(productId)
        console.log(`product ${product}`)
        orderItemsDetails.push({
            productId,
            name: product.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity
        })
    }

    // Return the res object with OK status and the order summary and order items
    res.status(200).json({
        message: `Order no. ${orderId}`,
        orderSummary,
        orderItemsDetails
    })
}
