/*
  Warnings:

  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `taxPercent` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUserId` on the `stock_logs` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_soldByUserId_fkey";

-- DropForeignKey
ALTER TABLE "stock_logs" DROP CONSTRAINT "stock_logs_createdByUserId_fkey";

-- DropIndex
DROP INDEX "invoices_soldByUserId_idx";

-- DropIndex
DROP INDEX "products_sku_idx";

-- DropIndex
DROP INDEX "products_sku_key";

-- DropIndex
DROP INDEX "stock_logs_createdByUserId_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "sku",
DROP COLUMN "taxPercent";

-- AlterTable
ALTER TABLE "stock_logs" DROP COLUMN "createdByUserId";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "Role";
