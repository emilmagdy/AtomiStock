import prisma from '../utils/prisma.js'
import AppError from '../utils/AppError.js'
import type { Request, Response } from 'express'

export const addProductController = async (req: Request, res: Response) => {
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


export const getProductsController = async (req: Request, res: Response) => {
    // Get all the products from the products tabel of db
    const products = await prisma.product.findMany()
    return res.status(200).json({
        message: "All products in the registry ",
        products: products
    })
}

export const getProductController = async (req: Request, res: Response) => {
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

export const editProductController = async (req: Request, res: Response) => {
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

    // Get the new changed data for that product from the req body
    const { name, vendor, unitPrice } = req.body

    // Ensure that at least one field is provided  
    if (name === undefined && vendor === undefined && unitPrice === undefined) {
        throw new AppError("At least one field should be provided", 400)
    }

    // Construct the data object with the provided fields only 
    type UpdateData = {
        name?: string;
        vendor?: string;
        unitPrice?: number;
    };
    const updateData: UpdateData = {}
    if (name !== undefined) {
        if (!name.trim()) throw new AppError("Name cannot be empty", 400);
        updateData.name = name.trim()
    }
    if (vendor !== undefined) {
        if (!vendor.trim()) throw new AppError("Vendor cannot be empty", 400)
        updateData.vendor = vendor.trim()
    }
    if (unitPrice !== undefined) {
        const parsedPrice = Number(unitPrice)
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            throw new AppError("unit price must be a positive number", 400)
        }
        updateData.unitPrice = parsedPrice
    }

    // Patch the selected product editing the selected fields only
    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData
    })
    return res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct
    })
}

export const deleteProductController = async (req: Request, res: Response) => {
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
