-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;
