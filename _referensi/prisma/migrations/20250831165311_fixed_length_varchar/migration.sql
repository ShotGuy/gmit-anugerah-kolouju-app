/*
  Warnings:

  - The primary key for the `alamat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `jaminan_kesehatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `jemaat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `keadaan_rumah` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `kecamatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `keluarga` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `kelurahan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `kota_kab` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pekerjaan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pendapatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `pendidikan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `provinsi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `rayon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `status_dalam_keluarga` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `status_keluarga` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `status_kepemilikan_rumah` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `suku` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."alamat" DROP CONSTRAINT "alamat_idKelurahan_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idJaminanKesehatan_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idKeluarga_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idPekerjaan_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idPendapatan_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idPendidikan_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idStatusDalamKeluarga_fkey";

-- DropForeignKey
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_idSuku_fkey";

-- DropForeignKey
ALTER TABLE "public"."kecamatan" DROP CONSTRAINT "kecamatan_idKotaKab_fkey";

-- DropForeignKey
ALTER TABLE "public"."keluarga" DROP CONSTRAINT "keluarga_idAlamat_fkey";

-- DropForeignKey
ALTER TABLE "public"."keluarga" DROP CONSTRAINT "keluarga_idKeadaanRumah_fkey";

-- DropForeignKey
ALTER TABLE "public"."keluarga" DROP CONSTRAINT "keluarga_idRayon_fkey";

-- DropForeignKey
ALTER TABLE "public"."keluarga" DROP CONSTRAINT "keluarga_idStatusKeluarga_fkey";

-- DropForeignKey
ALTER TABLE "public"."keluarga" DROP CONSTRAINT "keluarga_idStatusKepemilikanRumah_fkey";

-- DropForeignKey
ALTER TABLE "public"."kelurahan" DROP CONSTRAINT "kelurahan_idKecamatan_fkey";

-- DropForeignKey
ALTER TABLE "public"."kota_kab" DROP CONSTRAINT "kota_kab_idProvinsi_fkey";

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_idJemaat_fkey";

-- AlterTable
ALTER TABLE "public"."alamat" DROP CONSTRAINT "alamat_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idKelurahan" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "alamat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."jaminan_kesehatan" DROP CONSTRAINT "jaminan_kesehatan_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "jaminan_kesehatan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."jemaat" DROP CONSTRAINT "jemaat_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idKeluarga" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idStatusDalamKeluarga" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idSuku" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idPendidikan" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idPekerjaan" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idPendapatan" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idJaminanKesehatan" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idAtestasi" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idPernikahan" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "jemaat_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."keadaan_rumah" DROP CONSTRAINT "keadaan_rumah_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "keadaan_rumah_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."kecamatan" DROP CONSTRAINT "kecamatan_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idKotaKab" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "kecamatan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."keluarga" DROP CONSTRAINT "keluarga_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idAlamat" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idStatusKeluarga" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idStatusKepemilikanRumah" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idKeadaanRumah" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idRayon" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "keluarga_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."kelurahan" DROP CONSTRAINT "kelurahan_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idKecamatan" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "kelurahan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."kota_kab" DROP CONSTRAINT "kota_kab_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idProvinsi" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "kota_kab_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."pekerjaan" DROP CONSTRAINT "pekerjaan_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "pekerjaan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."pendapatan" DROP CONSTRAINT "pendapatan_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "pendapatan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."pendidikan" DROP CONSTRAINT "pendidikan_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "pendidikan_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."provinsi" DROP CONSTRAINT "provinsi_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "provinsi_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."rayon" DROP CONSTRAINT "rayon_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "rayon_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."status_dalam_keluarga" DROP CONSTRAINT "status_dalam_keluarga_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "status_dalam_keluarga_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."status_keluarga" DROP CONSTRAINT "status_keluarga_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "status_keluarga_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."status_kepemilikan_rumah" DROP CONSTRAINT "status_kepemilikan_rumah_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "status_kepemilikan_rumah_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."suku" DROP CONSTRAINT "suku_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "suku_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "idJemaat" SET DATA TYPE VARCHAR(80),
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."kota_kab" ADD CONSTRAINT "kota_kab_idProvinsi_fkey" FOREIGN KEY ("idProvinsi") REFERENCES "public"."provinsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kecamatan" ADD CONSTRAINT "kecamatan_idKotaKab_fkey" FOREIGN KEY ("idKotaKab") REFERENCES "public"."kota_kab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kelurahan" ADD CONSTRAINT "kelurahan_idKecamatan_fkey" FOREIGN KEY ("idKecamatan") REFERENCES "public"."kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alamat" ADD CONSTRAINT "alamat_idKelurahan_fkey" FOREIGN KEY ("idKelurahan") REFERENCES "public"."kelurahan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keluarga" ADD CONSTRAINT "keluarga_idAlamat_fkey" FOREIGN KEY ("idAlamat") REFERENCES "public"."alamat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keluarga" ADD CONSTRAINT "keluarga_idStatusKeluarga_fkey" FOREIGN KEY ("idStatusKeluarga") REFERENCES "public"."status_keluarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keluarga" ADD CONSTRAINT "keluarga_idStatusKepemilikanRumah_fkey" FOREIGN KEY ("idStatusKepemilikanRumah") REFERENCES "public"."status_kepemilikan_rumah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keluarga" ADD CONSTRAINT "keluarga_idKeadaanRumah_fkey" FOREIGN KEY ("idKeadaanRumah") REFERENCES "public"."keadaan_rumah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keluarga" ADD CONSTRAINT "keluarga_idRayon_fkey" FOREIGN KEY ("idRayon") REFERENCES "public"."rayon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user" ADD CONSTRAINT "user_idJemaat_fkey" FOREIGN KEY ("idJemaat") REFERENCES "public"."jemaat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idKeluarga_fkey" FOREIGN KEY ("idKeluarga") REFERENCES "public"."keluarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idStatusDalamKeluarga_fkey" FOREIGN KEY ("idStatusDalamKeluarga") REFERENCES "public"."status_dalam_keluarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idSuku_fkey" FOREIGN KEY ("idSuku") REFERENCES "public"."suku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idPendidikan_fkey" FOREIGN KEY ("idPendidikan") REFERENCES "public"."pendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idPekerjaan_fkey" FOREIGN KEY ("idPekerjaan") REFERENCES "public"."pekerjaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idPendapatan_fkey" FOREIGN KEY ("idPendapatan") REFERENCES "public"."pendapatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jemaat" ADD CONSTRAINT "jemaat_idJaminanKesehatan_fkey" FOREIGN KEY ("idJaminanKesehatan") REFERENCES "public"."jaminan_kesehatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
