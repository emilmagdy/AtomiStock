# E-Commerce & Inventory Management API

A secure,type-safe, high-performance RESTful backend service built with**Typescript** **Node.js**, **Express**, and **Prisma ORM** over **PostgreSQL**. 

This system features a custom **FIFO (First-In, First-Out) batch inventory engine**, strict **ACID transactional safety**, precise **financial decimal modeling**, and robust **Insecure Direct Object Reference (IDOR)** safeguards.

---

## Key Features

* **FIFO Inventory Engine**: Deducts inventory dynamically from batch records (`StockBatch`) starting with the oldest stock (`addedAt: asc`). Restores stock seamlessly upon cancellation by creating new batch records at the end of the queue.
* **Atomic Transaction Safety**: Employs interactive Prisma transactions (`prisma.$transaction`) across order creation and cancellation to prevent stock race conditions and partial failures.
* **Financial Data Integrity**: Uses PostgreSQL `Decimal` types (`Decimal(10,2)` for item prices, `Decimal(12,2)` for order totals) to prevent floating-point inaccuracies.
* **Security & Access Control**: Enforces JWT authentication, user ownership validation (IDOR protection), and Role-Based Access Control (RBAC) for customers and administrators.
* **Historical Audit Safeguards**: Enforces `onDelete: Restrict` rules on financial relations to prevent accidental deletion of transaction history.

---

## Tech Stack

* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: PostgreSQL
* **ORM**: Prisma ORM (utilizing `@map` snake_case database mapping)
* **Authentication**: JSON Web Tokens (JWT) & bcrypt

---

## Database Architecture

Below is an overview of the core Prisma schema modeling the order lifecycle and inventory batches:

```prisma
model Order {
  id          Int         @id @default(autoincrement())
  userId      Int         @map("user_id")
  totalAmount Decimal     @map("total_amount") @db.Decimal(12, 2)
  orderStatus OrderStatus @default(PENDING) @map("order_status")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  user        User        @relation(fields: [userId], references: [id])
  orderItems  OrderItem[]

  @@map("orders")
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int     @map("order_id")
  productId Int     @map("product_id")
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@map("order_items")
}

model StockBatch {
  id        Int      @id @default(autoincrement())
  productId Int      @map("product_id")
  quantity  Int
  addedAt   DateTime @default(now()) @map("added_at")

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("stock_batches")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```
## Installation & Setup
1. Prerequisites
Node.js (v18+ recommended)

PostgreSQL instance running locally or hosted

2. Environment Variables
Create a .env file in the root directory:

```
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your_secure_jwt_secret"
```

3. Setup Commands
Bash
### Install dependencies
npm install

### Run database migrations
npx prisma migrate dev --name init

### Build the codebase and Generate prisma client
npm run build

### Start the development server
npm start

## Key Implementation Highlights
Order Cancellation & Batch Restoration Logic
When a customer or admin cancels an order, the system handles the restoration atomically inside a single database transaction:

```Typescript
import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../config/prisma' 
import { AppError } from '../utils/AppError' 

// Extend Express Request type inline if custom user object is not declared globally
interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    role: string
  }
}

export const cancelOrdersController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const user = req.user
  if (!user || !user.id) throw new AppError("Authorization required", 401)

  const orderId = Number(req.params.id)
  if (!orderId || isNaN(orderId)) throw new AppError("Invalid ID parameter", 400)

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    })

    if (!order) throw new AppError("Order not found", 404)
    if (order.orderStatus !== "PENDING") throw new AppError("Order cannot be cancelled", 400)
    if (order.userId !== user.id && user.role !== "ADMIN") throw new AppError("Unauthorized", 403)

    // Strictly type the batch array using Prisma's UncheckedCreateInput type for StockBatch
    const stockBatchesData: Prisma.StockBatchUncheckedCreateInput[] = []

    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } }
      })

      stockBatchesData.push({
        productId: item.productId,
        quantity: item.quantity
      })
    }

    const createdBatches = await tx.stockBatch.createMany({ data: stockBatchesData })

    const cancelledOrder = await tx.order.update({
      where: { id: orderId },
      data: { orderStatus: "CANCELLED" }
    })

    return { createdBatches, cancelledOrder }
  })

  return res.status(200).json({
    message: `Order ${orderId} cancelled successfully`,
    cancelledOrder: result.cancelledOrder,
    createdBatches: result.createdBatches
  })
}
```
# Application API Endpoints Reference

Base URL: `/api/v1`

---

## 1. Authentication & Users (`/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/users/register` | Public | Register a new customer account |
| **`POST`** | `/users/login` | Public | Authenticate user and return JWT access token |
| **`GET`** | `/users/profile` | Authenticated | Retrieve profile details of currently logged-in user |

---

## 2. Products (`/products`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/products` | Public | List products with pagination and search |
| **`GET`** | `/products/:id` | Public | Fetch single product details and overall stock availability |
| **`POST`** | `/products` | Admin | Create a new product entry in the catalog |
| **`PATCH`**| `/products/:id` | Admin | Update product information (price, description) |
| **`DELETE`**| `/products/:id` | Admin | Soft delete or deactivate a product |

---

## 3. Stock & Inventory (`/stock-batches`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/stock-batches/product/:productId` | Admin | View all active FIFO stock batches for a product |
| **`POST`** | `/stock-batches` | Admin | Add a new stock batch for a product (`addedAt: now()`) |
| **`PATCH`**| `/stock-batches/:id` | Admin | Adjust batch quantity or details manually |

---

## 4. Orders & Inventory Allocation (`/orders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **`POST`** | `/orders` | Customer | Create order with atomic FIFO batch deduction |
| **`GET`** | `/orders` | Customer | Get paginated order history for logged-in user |
| **`GET`** | `/orders/:id` | Customer / Admin | Fetch single order details with nested `orderItems` |
| **`PATCH`**| `/orders/:id/cancel` | Customer / Admin | Soft-delete/cancel order and restore inventory batches |

```
