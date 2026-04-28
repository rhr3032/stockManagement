/*
  Warnings:

  - You are about to drop the column `dueBalance` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `soldByUserId` on the `invoices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "dueBalance";

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "soldByUserId";
