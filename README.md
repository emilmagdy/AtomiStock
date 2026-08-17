# E-Commerce & Inventory Management API

A secure, high-performance RESTful backend service built with **Node.js**, **Express**, and **Prisma ORM** over **PostgreSQL**. 

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

