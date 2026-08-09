import prisma from '../utils/prisma.js'
import AppError from '../utils/AppError.js'


export const addProductController = async (req, res) => {
    // Get the required fields fro the req body
    const { name, vendor, unitPrice } = req.body

    // Validate the presence of all required fields
    if (!name || !vendor || unitPrice === undefined) {
        throw new AppError("Some required feilds are missing", 400)
    }
    // add new product to the products table in the db
    const newProduct = await prisma.product.create({
        data: {
            name, vendor, unitPrice
        }, select: {
            id: true,
            name: true,
            vendor: true,
            unitPrice: true,
            addedAt: true
        }
    })

    return res.status(201).json({
        message: "Product added Successfully",
        product: newProduct
    })
}


export const getProductsController = async (req, res) => {
    // Get all the products from the products tabel of db
    const products = await prisma.product.findMany()
    return res.status(200).json({
        message: "All products in the registry ",
        products: products
    })
}

export const getProductController = async (req, res) => {
    // Get product id from the URL parameters
    const productId = Number(req.params.id)

    // Check if the id passed into the parameters isnt a number
    if (isNaN(productId)) {
        throw new AppError("Invalid Product Id parameter", 400)
    }

    // Check for the existance of the product in the db in case its deleted
    const productExists = await prisma.product.findUnique({
        where: { id: productId }
    })
    if (!productExists) {
        throw new AppError("Product doesnt exist", 404)
    }
    return res.status(200).json({
        message: ` ${productExists.name} found successfully`,
        product: productExists
    })
}

export const editProductController = async (req, res) => {
    // Get product id from the URL parameters
    const productId = Number(req.params.id)

    // Check if the id passed into the parameters isnt a number
    if (isNaN(productId)) {
        throw new AppError("Invalid Product Id parameter", 400)
    }

    // Check for the existance of the product in the db in case its deleted
    const productExists = await prisma.product.findUnique({
        where: { id: productId }
    })
    if (!productExists) {
        throw new AppError("Product doesnt exist", 404)
    }

    //Get the new changed data for that product from the req body
    const { name, vendor, unitPrice } = req.body

    //Validate the existance of all fields 
    if (!name || !vendor || unitPrice === undefined) {
        throw new AppError("Some required fields are missing", 400)
    }
    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
            name: name.trim(),
            vendor: vendor.trim(),
            unitPrice: Number(unitPrice)
        }
    })
    return res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct
    })
}

export const deleteProductController = async (req, res) => {
    // Get product id from the URL parameters
    const productId = Number(req.params.id)

    // Check if the id passed into the parameters isnt a number
    if (isNaN(productId)) {
        throw new AppError("Invalid Product Id parameter", 400)
    }

    // Check for the existance of the product in the db in case its deleted
    const productExists = await prisma.product.findUnique({
        where: { id: productId }
    })
    if (!productExists) {
        throw new AppError("Product doesnt exist", 404)
    }
    await prisma.product.delete({
        where: { id: productId }
    })
    return res.status(200).json({
        message: `Product deleted successfully`,
        product: productExists
    })
}



