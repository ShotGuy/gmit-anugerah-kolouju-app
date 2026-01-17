-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'JEMAAT', 'MAJELIS', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "public"."provinsi" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('prov_', gen_random_uuid()),
    "nama" VARCHAR(50) NOT NULL,

    CONSTRAINT "provinsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kota_kab" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('kab_', gen_random_uuid()),
    "idProvinsi" VARCHAR(40) NOT NULL,
    "nama" VARCHAR(50) NOT NULL,

    CONSTRAINT "kota_kab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kecamatan" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('kec_', gen_random_uuid()),
    "idKotaKab" VARCHAR(40) NOT NULL,
    "nama" VARCHAR(50) NOT NULL,

    CONSTRAINT "kecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kelurahan" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('kel_', gen_random_uuid()),
    "idKecamatan" VARCHAR(40) NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "kodepos" VARCHAR(10) NOT NULL,

    CONSTRAINT "kelurahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alamat" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('almt_', gen_random_uuid()),
    "idKelurahan" VARCHAR(40) NOT NULL,
    "rt" INTEGER NOT NULL,
    "rw" INTEGER NOT NULL,
    "jalan" VARCHAR(50) NOT NULL,

    CONSTRAINT "alamat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."status_keluarga" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('skel_', gen_random_uuid()),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "status_keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keadaan_rumah" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('krum_', gen_random_uuid()),
    "keadaan" VARCHAR(50) NOT NULL,

    CONSTRAINT "keadaan_rumah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."status_kepemilikan_rumah" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('srum_', gen_random_uuid()),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "status_kepemilikan_rumah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."status_dalam_keluarga" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('sdkel_', gen_random_uuid()),
    "status" VARCHAR(50) NOT NULL,

    CONSTRAINT "status_dalam_keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."suku" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('suku_', gen_random_uuid()),
    "namaSuku" VARCHAR(50) NOT NULL,

    CONSTRAINT "suku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pekerjaan" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('pkj_', gen_random_uuid()),
    "namaPekerjaan" VARCHAR(50) NOT NULL,

    CONSTRAINT "pekerjaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pendidikan" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('pend_', gen_random_uuid()),
    "jenjang" VARCHAR(50) NOT NULL,

    CONSTRAINT "pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pendapatan" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('pdpt_', gen_random_uuid()),
    "rentang" VARCHAR(50) NOT NULL,

    CONSTRAINT "pendapatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jaminan_kesehatan" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('jkes_', gen_random_uuid()),
    "jenisJaminan" VARCHAR(50) NOT NULL,

    CONSTRAINT "jaminan_kesehatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rayon" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('ray_', gen_random_uuid()),
    "namaRayon" VARCHAR(10) NOT NULL,

    CONSTRAINT "rayon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keluarga" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('kel_', gen_random_uuid()),
    "idAlamat" VARCHAR(40) NOT NULL,
    "idStatusKeluarga" VARCHAR(40) NOT NULL,
    "idStatusKepemilikanRumah" VARCHAR(40) NOT NULL,
    "idKeadaanRumah" VARCHAR(40) NOT NULL,
    "idRayon" VARCHAR(40) NOT NULL,
    "noBagungan" INTEGER NOT NULL,

    CONSTRAINT "keluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('usr_', gen_random_uuid()),
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "public"."Role" NOT NULL,
    "idJemaat" VARCHAR(40),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jemaat" (
    "id" VARCHAR(40) NOT NULL DEFAULT concat('jmt_', gen_random_uuid()),
    "idKeluarga" VARCHAR(40) NOT NULL,
    "idStatusDalamKeluarga" VARCHAR(40) NOT NULL,
    "idSuku" VARCHAR(40) NOT NULL,
    "idPendidikan" VARCHAR(40) NOT NULL,
    "idPekerjaan" VARCHAR(40) NOT NULL,
    "idPendapatan" VARCHAR(40) NOT NULL,
    "idJaminanKesehatan" VARCHAR(40) NOT NULL,
    "idAtestasi" VARCHAR(40),
    "idPernikahan" VARCHAR(40),
    "nama" VARCHAR(50) NOT NULL,
    "jenisKelamin" BOOLEAN NOT NULL,
    "tanggalLahir" DATE NOT NULL,
    "golonganDarah" VARCHAR(5),

    CONSTRAINT "jemaat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_idJemaat_key" ON "public"."user"("idJemaat");

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
