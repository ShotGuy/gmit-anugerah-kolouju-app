-- CreateEnum
CREATE TYPE "public"."TipeSection" AS ENUM ('VISI', 'MISI', 'SEJARAH', 'HERO', 'TENTANG');

-- AlterTable
ALTER TABLE "public"."kategori_pengumuman" ADD COLUMN     "pasalDeskripsi" TEXT;

-- CreateTable
CREATE TABLE "public"."konten_landing_page" (
    "id" VARCHAR(80) NOT NULL DEFAULT concat('klp_', gen_random_uuid()),
    "section" "public"."TipeSection" NOT NULL,
    "judul" VARCHAR(255) NOT NULL,
    "konten" TEXT NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" VARCHAR(80),
    "updated_by" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "konten_landing_page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_konten_section" ON "public"."konten_landing_page"("section");

-- CreateIndex
CREATE INDEX "idx_konten_active" ON "public"."konten_landing_page"("is_active");

-- CreateIndex
CREATE INDEX "idx_konten_published" ON "public"."konten_landing_page"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "konten_landing_page_section_urutan_key" ON "public"."konten_landing_page"("section", "urutan");
