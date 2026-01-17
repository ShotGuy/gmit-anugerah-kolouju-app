/*
  Warnings:

  - You are about to drop the column `kodepos` on the `kelurahan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idMajelis]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kodePos` to the `kelurahan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TipeAtestasi" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "public"."StatusJemaat" AS ENUM ('AKTIF', 'TIDAK_AKTIF', 'KELUAR');

-- CreateEnum
CREATE TYPE "public"."status_pengumuman" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."prioritas_pengumuman" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."StatusPeriode" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."StatusTransaksi" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED', 'PAID');

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'PENDETA';

-- AlterTable
ALTER TABLE "public"."jemaat" ADD COLUMN     "status" "public"."StatusJemaat" NOT NULL DEFAULT 'AKTIF';

-- AlterTable
ALTER TABLE "public"."kelurahan" DROP COLUMN "kodepos",
ADD COLUMN     "kodePos" VARCHAR(10) NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "idMajelis" VARCHAR(80),
ADD COLUMN     "noWhatsapp" VARCHAR(20),
ADD COLUMN     "username" VARCHAR(50);

-- CreateTable
CREATE TABLE "public"."atestasi" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('att_', gen_random_uuid()),
    "idJemaat" VARCHAR(80),
    "idKlasis" VARCHAR(80),
    "tipe" "public"."TipeAtestasi" NOT NULL,
    "tanggal" DATE NOT NULL,
    "gerejaAsal" VARCHAR(100),
    "gerejaTujuan" VARCHAR(100),
    "alasan" TEXT,
    "keterangan" TEXT,
    "namaCalonJemaat" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."klasis" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('kls_', gen_random_uuid()),
    "nama" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "klasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jenis_jabatan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('jb_', gen_random_uuid()),
    "namaJabatan" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "jenis_jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."majelis" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('mjl_', gen_random_uuid()),
    "namaLengkap" VARCHAR(50) NOT NULL,
    "mulai" DATE NOT NULL,
    "selesai" DATE,
    "idRayon" VARCHAR(80),
    "jenisJabatanId" VARCHAR(80),
    "jemaatId" VARCHAR(80),

    CONSTRAINT "majelis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pernikahan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('nikah_', gen_random_uuid()),
    "idKlasis" VARCHAR(80) NOT NULL,
    "tanggal" DATE NOT NULL,

    CONSTRAINT "pernikahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."baptis" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('bpt_', gen_random_uuid()),
    "idJemaat" VARCHAR(80) NOT NULL,
    "idKlasis" VARCHAR(80) NOT NULL,
    "tanggal" DATE NOT NULL,

    CONSTRAINT "baptis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sidi" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('sidi_', gen_random_uuid()),
    "idJemaat" VARCHAR(80) NOT NULL,
    "idKlasis" VARCHAR(80) NOT NULL,
    "tanggal" DATE NOT NULL,

    CONSTRAINT "sidi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jenis_ibadah" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('ibd_', gen_random_uuid()),
    "namaIbadah" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "jenis_ibadah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori_jadwal" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('ktg_', gen_random_uuid()),
    "namaKategori" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "kategori_jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jadwal_ibadah" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('jdw_', gen_random_uuid()),
    "idJenisIbadah" VARCHAR(80) NOT NULL,
    "idKategori" VARCHAR(80) NOT NULL,
    "idPemimpin" VARCHAR(80) NOT NULL,
    "idKeluarga" VARCHAR(80),
    "idRayon" VARCHAR(80),
    "judul" VARCHAR(100) NOT NULL,
    "tanggal" DATE NOT NULL,
    "waktuMulai" TIME,
    "waktuSelesai" TIME,
    "alamat" VARCHAR(200),
    "lokasi" VARCHAR(100),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapsLink" TEXT,
    "firman" VARCHAR(100),
    "tema" VARCHAR(100),
    "keterangan" TEXT,
    "idPembuat" VARCHAR(80),
    "jumlahLaki" INTEGER,
    "jumlahPerempuan" INTEGER,
    "targetPeserta" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "majelisId" VARCHAR(80),

    CONSTRAINT "jadwal_ibadah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori_pengumuman" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('kat_', gen_random_uuid()),
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jenis_pengumuman" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('jns_', gen_random_uuid()),
    "kategori_id" VARCHAR(80) NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pengumuman" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('png_', gen_random_uuid()),
    "judul" VARCHAR(255) NOT NULL,
    "kategori_id" VARCHAR(80) NOT NULL,
    "jenis_id" VARCHAR(80),
    "konten" JSONB NOT NULL,
    "tanggal_pengumuman" DATE NOT NULL,
    "status" "public"."status_pengumuman" NOT NULL DEFAULT 'DRAFT',
    "prioritas" "public"."prioritas_pengumuman" NOT NULL DEFAULT 'MEDIUM',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "created_by" VARCHAR(80),
    "updated_by" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kegiatan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('kgt_', gen_random_uuid()),
    "nama" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."galeri" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('gal_', gen_random_uuid()),
    "nama_kegiatan" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT,
    "tempat" VARCHAR(255) NOT NULL,
    "tanggal_kegiatan" DATE NOT NULL,
    "fotos" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "galeri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori_keuangan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('kkat_', gen_random_uuid()),
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_keuangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."item_keuangan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('item_', gen_random_uuid()),
    "kategori_id" VARCHAR(80) NOT NULL,
    "parent_id" VARCHAR(80),
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "target_frekuensi" INTEGER,
    "satuan_frekuensi" VARCHAR(20),
    "nominal_satuan" DECIMAL(15,2),
    "total_target" DECIMAL(15,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_keuangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."periode_anggaran" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('per_', gen_random_uuid()),
    "nama" VARCHAR(100) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_akhir" DATE NOT NULL,
    "status" "public"."StatusPeriode" NOT NULL DEFAULT 'DRAFT',
    "keterangan" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periode_anggaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."anggaran_item" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('ang_', gen_random_uuid()),
    "periode_id" VARCHAR(80) NOT NULL,
    "item_keuangan_id" VARCHAR(80) NOT NULL,
    "target_frekuensi" INTEGER,
    "satuan_frekuensi" VARCHAR(20),
    "nominal_satuan" DECIMAL(15,2),
    "total_anggaran" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anggaran_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaksi_penerimaan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('tpen_', gen_random_uuid()),
    "periode_id" VARCHAR(80) NOT NULL,
    "item_keuangan_id" VARCHAR(80) NOT NULL,
    "jadwal_ibadah_id" VARCHAR(80),
    "jemaat_id" VARCHAR(80),
    "keluarga_id" VARCHAR(80),
    "tanggal" DATE NOT NULL,
    "nominal" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT,
    "nomor_referensi" VARCHAR(50),
    "sumber_data" VARCHAR(50),
    "created_by" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_penerimaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaksi_pengeluaran" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('tkel_', gen_random_uuid()),
    "periode_id" VARCHAR(80) NOT NULL,
    "item_keuangan_id" VARCHAR(80) NOT NULL,
    "tanggal" DATE NOT NULL,
    "nominal" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT,
    "nomor_referensi" VARCHAR(50),
    "penerima" VARCHAR(100),
    "status" "public"."StatusTransaksi" NOT NULL DEFAULT 'DRAFT',
    "approved_by" VARCHAR(80),
    "approved_at" TIMESTAMP(3),
    "created_by" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_pengeluaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rekap_keuangan" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('rek_', gen_random_uuid()),
    "periode_id" VARCHAR(80) NOT NULL,
    "item_keuangan_id" VARCHAR(80) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "bulan" INTEGER,
    "target_anggaran" DECIMAL(15,2),
    "realisasi_nominal" DECIMAL(15,2) NOT NULL,
    "jumlah_transaksi" INTEGER NOT NULL,
    "persentase_realisasi" DOUBLE PRECISION,
    "selisih" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rekap_keuangan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jenis_pengumuman_kategori_id_key" ON "public"."jenis_pengumuman"("kategori_id");

-- CreateIndex
CREATE INDEX "idx_pengumuman_kategori" ON "public"."pengumuman"("kategori_id");

-- CreateIndex
CREATE INDEX "idx_pengumuman_jenis" ON "public"."pengumuman"("jenis_id");

-- CreateIndex
CREATE INDEX "idx_pengumuman_tanggal" ON "public"."pengumuman"("tanggal_pengumuman");

-- CreateIndex
CREATE INDEX "idx_pengumuman_status" ON "public"."pengumuman"("status");

-- CreateIndex
CREATE INDEX "idx_pengumuman_published" ON "public"."pengumuman"("status", "published_at");

-- CreateIndex
CREATE INDEX "idx_tanggal_kegiatan" ON "public"."galeri"("tanggal_kegiatan");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_keuangan_kode_key" ON "public"."kategori_keuangan"("kode");

-- CreateIndex
CREATE INDEX "idx_item_kategori" ON "public"."item_keuangan"("kategori_id");

-- CreateIndex
CREATE INDEX "idx_item_parent" ON "public"."item_keuangan"("parent_id");

-- CreateIndex
CREATE INDEX "idx_item_level" ON "public"."item_keuangan"("level");

-- CreateIndex
CREATE UNIQUE INDEX "item_keuangan_kategori_id_kode_key" ON "public"."item_keuangan"("kategori_id", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "anggaran_item_periode_id_item_keuangan_id_key" ON "public"."anggaran_item"("periode_id", "item_keuangan_id");

-- CreateIndex
CREATE INDEX "idx_periode_pen" ON "public"."transaksi_penerimaan"("periode_id");

-- CreateIndex
CREATE INDEX "idx_item_pen" ON "public"."transaksi_penerimaan"("item_keuangan_id");

-- CreateIndex
CREATE INDEX "idx_tanggal_pen" ON "public"."transaksi_penerimaan"("tanggal");

-- CreateIndex
CREATE INDEX "idx_ibadah_pen" ON "public"."transaksi_penerimaan"("jadwal_ibadah_id");

-- CreateIndex
CREATE INDEX "idx_periode_kel" ON "public"."transaksi_pengeluaran"("periode_id");

-- CreateIndex
CREATE INDEX "idx_item_kel" ON "public"."transaksi_pengeluaran"("item_keuangan_id");

-- CreateIndex
CREATE INDEX "idx_tanggal_kel" ON "public"."transaksi_pengeluaran"("tanggal");

-- CreateIndex
CREATE INDEX "idx_status_kel" ON "public"."transaksi_pengeluaran"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rekap_keuangan_periode_id_item_keuangan_id_tahun_bulan_key" ON "public"."rekap_keuangan"("periode_id", "item_keuangan_id", "tahun", "bulan");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_idMajelis_key" ON "public"."user"("idMajelis");

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_idMajelis_fkey" FOREIGN KEY ("idMajelis") REFERENCES "public"."majelis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idPernikahan_fkey" FOREIGN KEY ("idPernikahan") REFERENCES "public"."pernikahan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atestasi" ADD CONSTRAINT "atestasi_idJemaat_fkey" FOREIGN KEY ("idJemaat") REFERENCES "public"."jemaat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."atestasi" ADD CONSTRAINT "atestasi_idKlasis_fkey" FOREIGN KEY ("idKlasis") REFERENCES "public"."klasis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."majelis" ADD CONSTRAINT "majelis_jenisJabatanId_fkey" FOREIGN KEY ("jenisJabatanId") REFERENCES "public"."jenis_jabatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."majelis" ADD CONSTRAINT "majelis_jemaatId_fkey" FOREIGN KEY ("jemaatId") REFERENCES "public"."jemaat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."majelis" ADD CONSTRAINT "majelis_idRayon_fkey" FOREIGN KEY ("idRayon") REFERENCES "public"."rayon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pernikahan" ADD CONSTRAINT "pernikahan_idKlasis_fkey" FOREIGN KEY ("idKlasis") REFERENCES "public"."klasis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."baptis" ADD CONSTRAINT "baptis_idJemaat_fkey" FOREIGN KEY ("idJemaat") REFERENCES "public"."jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."baptis" ADD CONSTRAINT "baptis_idKlasis_fkey" FOREIGN KEY ("idKlasis") REFERENCES "public"."klasis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sidi" ADD CONSTRAINT "sidi_idJemaat_fkey" FOREIGN KEY ("idJemaat") REFERENCES "public"."jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sidi" ADD CONSTRAINT "sidi_idKlasis_fkey" FOREIGN KEY ("idKlasis") REFERENCES "public"."klasis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_ibadah" ADD CONSTRAINT "jadwal_ibadah_idJenisIbadah_fkey" FOREIGN KEY ("idJenisIbadah") REFERENCES "public"."jenis_ibadah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_ibadah" ADD CONSTRAINT "jadwal_ibadah_idKategori_fkey" FOREIGN KEY ("idKategori") REFERENCES "public"."kategori_jadwal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_ibadah" ADD CONSTRAINT "jadwal_ibadah_idPemimpin_fkey" FOREIGN KEY ("idPemimpin") REFERENCES "public"."jemaat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_ibadah" ADD CONSTRAINT "jadwal_ibadah_idKeluarga_fkey" FOREIGN KEY ("idKeluarga") REFERENCES "public"."keluarga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_ibadah" ADD CONSTRAINT "jadwal_ibadah_idRayon_fkey" FOREIGN KEY ("idRayon") REFERENCES "public"."rayon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_ibadah" ADD CONSTRAINT "jadwal_ibadah_idPembuat_fkey" FOREIGN KEY ("idPembuat") REFERENCES "public"."majelis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jenis_pengumuman" ADD CONSTRAINT "jenis_pengumuman_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori_pengumuman"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pengumuman" ADD CONSTRAINT "pengumuman_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori_pengumuman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pengumuman" ADD CONSTRAINT "pengumuman_jenis_id_fkey" FOREIGN KEY ("jenis_id") REFERENCES "public"."jenis_pengumuman"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_keuangan" ADD CONSTRAINT "item_keuangan_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "public"."kategori_keuangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."item_keuangan" ADD CONSTRAINT "item_keuangan_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."item_keuangan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anggaran_item" ADD CONSTRAINT "anggaran_item_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anggaran_item" ADD CONSTRAINT "anggaran_item_item_keuangan_id_fkey" FOREIGN KEY ("item_keuangan_id") REFERENCES "public"."item_keuangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_penerimaan" ADD CONSTRAINT "transaksi_penerimaan_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_penerimaan" ADD CONSTRAINT "transaksi_penerimaan_item_keuangan_id_fkey" FOREIGN KEY ("item_keuangan_id") REFERENCES "public"."item_keuangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_penerimaan" ADD CONSTRAINT "transaksi_penerimaan_jadwal_ibadah_id_fkey" FOREIGN KEY ("jadwal_ibadah_id") REFERENCES "public"."jadwal_ibadah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_penerimaan" ADD CONSTRAINT "transaksi_penerimaan_jemaat_id_fkey" FOREIGN KEY ("jemaat_id") REFERENCES "public"."jemaat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_penerimaan" ADD CONSTRAINT "transaksi_penerimaan_keluarga_id_fkey" FOREIGN KEY ("keluarga_id") REFERENCES "public"."keluarga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_pengeluaran" ADD CONSTRAINT "transaksi_pengeluaran_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_pengeluaran" ADD CONSTRAINT "transaksi_pengeluaran_item_keuangan_id_fkey" FOREIGN KEY ("item_keuangan_id") REFERENCES "public"."item_keuangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rekap_keuangan" ADD CONSTRAINT "rekap_keuangan_periode_id_fkey" FOREIGN KEY ("periode_id") REFERENCES "public"."periode_anggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rekap_keuangan" ADD CONSTRAINT "rekap_keuangan_item_keuangan_id_fkey" FOREIGN KEY ("item_keuangan_id") REFERENCES "public"."item_keuangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
