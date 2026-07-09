/*
  Warnings:

  - You are about to drop the column `label` on the `MapSpot` table. All the data in the column will be lost.
  - You are about to drop the column `rewardMax` on the `MapSpot` table. All the data in the column will be lost.
  - You are about to drop the column `rewardMin` on the `MapSpot` table. All the data in the column will be lost.
  - You are about to drop the column `requiredLevelPerLevel` on the `Skill` table. All the data in the column will be lost.
  - Added the required column `actionLabel` to the `MapSpot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spotLabel` to the `MapSpot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Extra" ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'boost';

-- AlterTable
ALTER TABLE "MapSpot" DROP COLUMN "label",
DROP COLUMN "rewardMax",
DROP COLUMN "rewardMin",
ADD COLUMN     "actionLabel" TEXT NOT NULL,
ADD COLUMN     "reward" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "spotLabel" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "lastInterestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSurgeryAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "requiredLevelPerLevel",
ADD COLUMN     "unlockLevel" INTEGER NOT NULL DEFAULT 1;
