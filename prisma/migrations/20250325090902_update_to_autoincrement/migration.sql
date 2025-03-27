/*
  Warnings:

  - The primary key for the `Contest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Contest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Participant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Participant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Vote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Vote` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `contestId` on the `Participant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `participantId` on the `Vote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_contestId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_participantId_fkey";

-- DropIndex
DROP INDEX "Vote_cookieId_key";

-- AlterTable
ALTER TABLE "Contest" DROP CONSTRAINT "Contest_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Contest_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "contestId",
ADD COLUMN     "contestId" INTEGER NOT NULL,
ADD CONSTRAINT "Participant_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "participantId",
ADD COLUMN     "participantId" INTEGER NOT NULL,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_participantId_cookieId_key" ON "Vote"("participantId", "cookieId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
