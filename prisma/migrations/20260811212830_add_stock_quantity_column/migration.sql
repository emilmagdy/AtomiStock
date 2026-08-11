/*
  Warnings:

  - You are about to alter the column `unit_price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `unit_price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stock_quantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(10,2);
