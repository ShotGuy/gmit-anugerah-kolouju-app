-- AlterTable
ALTER TABLE "public"."kecamatan" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."kelurahan" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."kota_kab" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."provinsi" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
