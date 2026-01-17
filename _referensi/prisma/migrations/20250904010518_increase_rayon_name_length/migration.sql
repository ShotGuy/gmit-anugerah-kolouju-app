/*
  Warnings:

  - You are about to drop the column `idAtestasi` on the `jemaat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."jemaat" DROP COLUMN "idAtestasi";

-- AlterTable
ALTER TABLE "public"."rayon" ALTER COLUMN "namaRayon" SET DATA TYPE VARCHAR(50);
