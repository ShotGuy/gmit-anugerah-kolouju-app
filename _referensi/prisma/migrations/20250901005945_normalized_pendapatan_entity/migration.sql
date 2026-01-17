/*
  Warnings:

  - You are about to drop the column `rentang` on the `pendapatan` table. All the data in the column will be lost.
  - Added the required column `label` to the `pendapatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max` to the `pendapatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min` to the `pendapatan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."pendapatan" DROP COLUMN "rentang",
ADD COLUMN     "label" VARCHAR(50) NOT NULL,
ADD COLUMN     "max" INTEGER NOT NULL,
ADD COLUMN     "min" INTEGER NOT NULL;
