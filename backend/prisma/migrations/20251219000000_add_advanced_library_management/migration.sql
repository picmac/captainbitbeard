-- CreateEnum
CREATE TYPE "GameRegion" AS ENUM ('USA', 'EUR', 'JPN', 'KOR', 'CHN', 'BRA', 'AUS', 'WORLD', 'UNK');

-- AlterTable games - Add multi-file and version tracking columns
ALTER TABLE "games" ADD COLUMN "parent_game_id" TEXT,
ADD COLUMN "file_number" INTEGER,
ADD COLUMN "is_multi_file" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "region" "GameRegion" DEFAULT 'USA',
ADD COLUMN "revision" TEXT,
ADD COLUMN "version_notes" TEXT;

-- CreateTable GameVersion
CREATE TABLE "game_versions" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "version_name" TEXT NOT NULL,
    "region" "GameRegion" NOT NULL,
    "revision" TEXT,
    "rom_path" TEXT NOT NULL,
    "md5_hash" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "release_date" TIMESTAMP(3),
    "changes" TEXT,
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable SavedSearch
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "systems" TEXT[],
    "genres" TEXT[],
    "developers" TEXT[],
    "publishers" TEXT[],
    "year_from" INTEGER,
    "year_to" INTEGER,
    "players" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- AlterTable bios_files - Add new columns if they don't exist
DO $$
BEGIN
    -- Check and add file_size if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bios_files' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE "bios_files" ADD COLUMN "file_size" BIGINT NOT NULL DEFAULT 0;
    END IF;

    -- Check and add description if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bios_files' AND column_name = 'description'
    ) THEN
        ALTER TABLE "bios_files" ADD COLUMN "description" TEXT;
    END IF;

    -- Check and add region if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bios_files' AND column_name = 'region'
    ) THEN
        ALTER TABLE "bios_files" ADD COLUMN "region" TEXT;
    END IF;

    -- Check and add version if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bios_files' AND column_name = 'version'
    ) THEN
        ALTER TABLE "bios_files" ADD COLUMN "version" TEXT;
    END IF;

    -- Check and add verified if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bios_files' AND column_name = 'verified'
    ) THEN
        ALTER TABLE "bios_files" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Check and add uploaded_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bios_files' AND column_name = 'uploaded_by'
    ) THEN
        ALTER TABLE "bios_files" ADD COLUMN "uploaded_by" TEXT;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX "games_parent_game_id_idx" ON "games"("parent_game_id");

-- CreateIndex
CREATE INDEX "game_versions_game_id_idx" ON "game_versions"("game_id");

-- CreateIndex
CREATE INDEX "game_versions_region_idx" ON "game_versions"("region");

-- CreateIndex
CREATE INDEX "saved_searches_user_id_idx" ON "saved_searches"("user_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_parent_game_id_fkey"
    FOREIGN KEY ("parent_game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_versions" ADD CONSTRAINT "game_versions_game_id_fkey"
    FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
