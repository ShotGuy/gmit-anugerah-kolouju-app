/*
  Warnings:

  - You are about to drop the `anggaran_item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rekap_keuangan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaksi_penerimaan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaksi_pengeluaran` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[kategori_id,periode_id,kode]` on the table `item_keuangan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kategori_id,nama]` on the table `jenis_pengumuman` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noKK]` on the table `keluarga` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `periode_id` to the `item_keuangan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipeDokumen" AS ENUM ('BAPTIS', 'SIDI', 'NIKAH', 'LAINNYA');

-- CreateEnum
CREATE TYPE "public"."StatusDokumen" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "public"."anggaran_item" DROP CONSTRAINT "anggaran_item_item_keuangan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."anggaran_item" DROP CONSTRAINT "anggaran_item_periode_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rekap_keuangan" DROP CONSTRAINT "rekap_keuangan_item_keuangan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."rekap_keuangan" DROP CONSTRAINT "rekap_keuangan_periode_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_penerimaan" DROP CONSTRAINT "transaksi_penerimaan_item_keuangan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_penerimaan" DROP CONSTRAINT "transaksi_penerimaan_jadwal_ibadah_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_penerimaan" DROP CONSTRAINT "transaksi_penerimaan_jemaat_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_penerimaan" DROP CONSTRAINT "transaksi_penerimaan_keluarga_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_penerimaan" DROP CONSTRAINT "transaksi_penerimaan_periode_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_pengeluaran" DROP CONSTRAINT "transaksi_pengeluaran_item_keuangan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transaksi_pengeluaran" DROP CONSTRAINT "transaksi_pengeluaran_periode_id_fkey";

-- DropIndex
DROP INDEX "public"."item_keuangan_kategori_id_kode_key";

-- DropIndex
DROP INDEX "public"."jenis_pengumuman_kategori_id_key";

-- AlterTable
ALTER TABLE "public"."item_keuangan" ADD COLUMN     "jumlah_transaksi" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "keterangan" TEXT,
ADD COLUMN     "nominal_actual" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "periode_id" VARCHAR(80) NOT NULL;

-- AlterTable
ALTER TABLE "public"."keluarga" ADD COLUMN     "noKK" VARCHAR(20);

-- AlterTable
ALTER TABLE "public"."majelis" ADD COLUMN     "canCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageRayon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canView" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isUtama" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "idRayon" VARCHAR(80),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."anggaran_item";

-- DropTable
DROP TABLE "public"."rekap_keuangan";

-- DropTable
DROP TABLE "public"."transaksi_penerimaan";

-- DropTable
DROP TABLE "public"."transaksi_pengeluaran";

-- CreateTable
CREATE TABLE "public"."realisasi_item_keuangan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('rik_', gen_random_uuid()),
    "item_keuangan_id" VARCHAR(80) NOT NULL,
    "periode_id" VARCHAR(80) NOT NULL,
    "tanggal_realisasi" DATE NOT NULL,
    "total_realisasi" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "realisasi_item_keuangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dokumen_jemaat" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('dok_', gen_random_uuid()),
    "jemaatId" VARCHAR(80) NOT NULL,
    "tipeDokumen" "public"."TipeDokumen" NOT NULL,
    "judulDokumen" VARCHAR(255),
    "namaFile" VARCHAR(255) NOT NULL,
    "urlFile" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "statusDokumen" "public"."StatusDokumen" NOT NULL DEFAULT 'PENDING',
    "catatan" TEXT,
    "uploadedBy" VARCHAR(80) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "verified_by" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_jemaat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profil_pendeta" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('ppd_', gen_random_uuid()),
    "nama" VARCHAR(100) NOT NULL,
    "urlFoto" TEXT,
    "s3Key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(80),
    "updated_by" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profil_pendeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_realisasi_item" ON "public"."realisasi_item_keuangan"("item_keuangan_id");

-- CreateIndex
CREATE INDEX "idx_realisasi_periode" ON "public"."realisasi_item_keuangan"("periode_id");

-- CreateIndex
CREATE INDEX "idx_realisasi_tanggal" ON "public"."realisasi_item_keuangan"("tanggal_realisasi");

-- CreateIndex
CREATE INDEX "idx_dokumen_jemaat" ON "public"."dokumen_jemaat"("jemaatId");

-- CreateIndex
CREATE INDEX "idx_dokumen_tipe" ON "public"."dokumen_jemaat"("tipeDokumen");

-- CreateIndex
CREATE INDEX "idx_dokumen_status" ON "public"."dokumen_jemaat"("statusDokumen");

-- CreateIndex
CREATE UNIQUE INDEX "dokumen_jemaat_jemaatId_tipeDokumen_key" ON "public"."dokumen_jemaat"("jemaatId", "tipeDokumen");

-- CreateIndex
CREATE INDEX "idx_profil_pendeta_active" ON "public"."profil_pendeta"("is_active");

-- CreateIndex
CREATE INDEX "idx_item_periode" ON "public"."item_keuangan"("periode_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_keuangan_kategori_id_periode_id_kode_key" ON "public"."item_keuangan"("kategori_id", "periode_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_pengumuman_kategori_id_nama_key" ON "public"."jenis_pengumuman"("kategori_id", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "keluarga_noKK_key" ON "public"."keluarga"("noKK");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_idRayon_fkey" FOREIGN KEY ("idRayon") REFERENCES "public"."rayon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_keuangan" ADD CONSTRAINT "item_keuangan_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."realisasi_item_keuangan" ADD CONSTRAINT "realisasi_item_keuangan_item_keuangan_id_fkey" FOREIGN KEY ("item_keuangan_id") REFERENCES "public"."item_keuangan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."realisasi_item_keuangan" ADD CONSTRAINT "realisasi_item_keuangan_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dokumen_jemaat" ADD CONSTRAINT "dokumen_jemaat_jemaatId_fkey" FOREIGN KEY ("jemaatId") REFERENCES "public"."jemaat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dokumen_jemaat" ADD CONSTRAINT "dokumen_jemaat_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dokumen_jemaat" ADD CONSTRAINT "dokumen_jemaat_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
