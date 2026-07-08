-- CreateEnum
CREATE TYPE "AttackMode" AS ENUM ('normal', 'defensive', 'aggressive');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('gun', 'drink', 'hooker', 'card', 'blueprint', 'consumable', 'booster', 'grenade', 'car', 'dog', 'credit_pack', 'special');

-- CreateEnum
CREATE TYPE "MapType" AS ENUM ('street', 'city');

-- CreateEnum
CREATE TYPE "MessageFolder" AS ENUM ('inbox', 'sent', 'saved');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('pending', 'accepted');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('strength', 'intellect', 'experience', 'sexapeal', 'manufacturer', 'fight', 'smuggler');

-- CreateEnum
CREATE TYPE "BankTransactionType" AS ENUM ('deposit', 'withdraw', 'buy_cash', 'buy_connections', 'loan', 'loan_repay');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "respect" INTEGER NOT NULL DEFAULT 0,
    "standing" INTEGER NOT NULL DEFAULT 0,
    "avatarId" INTEGER NOT NULL DEFAULT -1,
    "cash" INTEGER NOT NULL DEFAULT 5000,
    "bankBalance" INTEGER NOT NULL DEFAULT 0,
    "credits" INTEGER NOT NULL DEFAULT 10,
    "connections" INTEGER NOT NULL DEFAULT 0,
    "life" INTEGER NOT NULL DEFAULT 100,
    "maxLife" INTEGER NOT NULL DEFAULT 100,
    "stamina" INTEGER NOT NULL DEFAULT 100,
    "maxStamina" INTEGER NOT NULL DEFAULT 100,
    "heat" INTEGER NOT NULL DEFAULT 0,
    "criminalRecord" INTEGER NOT NULL DEFAULT 0,
    "toxication" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "intellect" INTEGER NOT NULL DEFAULT 10,
    "sexapeal" INTEGER NOT NULL DEFAULT 10,
    "fitnessPoints" INTEGER NOT NULL DEFAULT 12,
    "maxFitnessPoints" INTEGER NOT NULL DEFAULT 12,
    "schoolPoints" INTEGER NOT NULL DEFAULT 12,
    "maxSchoolPoints" INTEGER NOT NULL DEFAULT 12,
    "hookerPoints" INTEGER NOT NULL DEFAULT 12,
    "maxHookerPoints" INTEGER NOT NULL DEFAULT 12,
    "battlePoints" INTEGER NOT NULL DEFAULT 10,
    "maxBattlePoints" INTEGER NOT NULL DEFAULT 10,
    "lastRegenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freeSkillPoints" INTEGER NOT NULL DEFAULT 0,
    "attackMode" "AttackMode" NOT NULL DEFAULT 'normal',
    "streetX" INTEGER NOT NULL DEFAULT 0,
    "streetY" INTEGER NOT NULL DEFAULT 0,
    "vipExpiresAt" TIMESTAMP(3),
    "factionId" TEXT,
    "gangId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredLevelPerLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerSkill" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemType" (
    "id" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "buyCash" INTEGER NOT NULL DEFAULT 0,
    "sellCash" INTEGER NOT NULL DEFAULT 0,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "effect" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "ItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "itemTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equippedSlot" TEXT,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Bar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarItem" (
    "id" TEXT NOT NULL,
    "barId" TEXT NOT NULL,
    "itemTypeId" TEXT NOT NULL,
    "quantityAvailable" INTEGER NOT NULL,
    "maxQuantity" INTEGER NOT NULL,
    "nextAvailableAt" TIMESTAMP(3),

    CONSTRAINT "BarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapSpot" (
    "id" TEXT NOT NULL,
    "mapType" "MapType" NOT NULL,
    "spotKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cashCost" INTEGER NOT NULL DEFAULT 0,
    "staminaCost" INTEGER NOT NULL DEFAULT 0,
    "riskPercent" INTEGER NOT NULL DEFAULT 0,
    "rewardMin" INTEGER NOT NULL DEFAULT 0,
    "rewardMax" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MapSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrimeLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "attackerId" TEXT NOT NULL,
    "victimId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "folder" "MessageFolder" NOT NULL DEFAULT 'inbox',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "rewardCash" INTEGER NOT NULL,
    "requirements" JSONB NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerQuest" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PlayerQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "rewardItemId" TEXT,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTaskProgress" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerTaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAchievement" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Racket" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "incomeRate" INTEGER NOT NULL,
    "lastCollectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Racket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closesAt" TIMESTAMP(3),

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollVote" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayTypeVote" (
    "id" TEXT NOT NULL,
    "dayType" "DayType" NOT NULL,
    "playerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DayTypeVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "BankTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "principal" INTEGER NOT NULL,
    "stakeStrength" INTEGER NOT NULL,
    "stakeIntellect" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "repaidAt" TIMESTAMP(3),

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Safebox" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashFound" INTEGER NOT NULL,

    CONSTRAINT "Safebox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JailSentence" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "jailedUntil" TIMESTAMP(3) NOT NULL,
    "rebelsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JailSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JailChatMessage" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JailChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ambush" (
    "id" TEXT NOT NULL,
    "setterId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ambush_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "extraId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceCredits" INTEGER NOT NULL,
    "durationHours" INTEGER NOT NULL,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerActiveExtra" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerActiveExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassifiedAd" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassifiedAd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonWinner" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    "prize" TEXT,

    CONSTRAINT "SeasonWinner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "itemTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Player_respect_idx" ON "Player"("respect");

-- CreateIndex
CREATE INDEX "Player_streetX_streetY_idx" ON "Player"("streetX", "streetY");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_key_key" ON "Skill"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerSkill_playerId_skillId_key" ON "PlayerSkill"("playerId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemType_typeId_key" ON "ItemType"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_playerId_itemTypeId_equippedSlot_key" ON "InventoryItem"("playerId", "itemTypeId", "equippedSlot");

-- CreateIndex
CREATE UNIQUE INDEX "BarItem_barId_itemTypeId_key" ON "BarItem"("barId", "itemTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "MapSpot_mapType_spotKey_key" ON "MapSpot"("mapType", "spotKey");

-- CreateIndex
CREATE INDEX "CrimeLog_attackerId_idx" ON "CrimeLog"("attackerId");

-- CreateIndex
CREATE INDEX "CrimeLog_victimId_idx" ON "CrimeLog"("victimId");

-- CreateIndex
CREATE INDEX "Message_recipientId_idx" ON "Message"("recipientId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_fromId_toId_key" ON "Friendship"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTaskProgress_playerId_taskId_date_key" ON "PlayerTaskProgress"("playerId", "taskId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_key_key" ON "Achievement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievement_playerId_achievementId_key" ON "PlayerAchievement"("playerId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "PollVote_pollId_playerId_key" ON "PollVote"("pollId", "playerId");

-- CreateIndex
CREATE INDEX "DayTypeVote_date_idx" ON "DayTypeVote"("date");

-- CreateIndex
CREATE UNIQUE INDEX "JailSentence_playerId_key" ON "JailSentence"("playerId");

-- CreateIndex
CREATE INDEX "JailChatMessage_createdAt_idx" ON "JailChatMessage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Extra_extraId_key" ON "Extra"("extraId");

-- CreateIndex
CREATE INDEX "MarketListing_itemTypeId_idx" ON "MarketListing"("itemTypeId");

-- AddForeignKey
ALTER TABLE "PlayerSkill" ADD CONSTRAINT "PlayerSkill_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSkill" ADD CONSTRAINT "PlayerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "ItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bar" ADD CONSTRAINT "Bar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarItem" ADD CONSTRAINT "BarItem_barId_fkey" FOREIGN KEY ("barId") REFERENCES "Bar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarItem" ADD CONSTRAINT "BarItem_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "ItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeLog" ADD CONSTRAINT "CrimeLog_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrimeLog" ADD CONSTRAINT "CrimeLog_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuest" ADD CONSTRAINT "PlayerQuest_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuest" ADD CONSTRAINT "PlayerQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTaskProgress" ADD CONSTRAINT "PlayerTaskProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTaskProgress" ADD CONSTRAINT "PlayerTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DailyTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Racket" ADD CONSTRAINT "Racket_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayTypeVote" ADD CONSTRAINT "DayTypeVote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Safebox" ADD CONSTRAINT "Safebox_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JailSentence" ADD CONSTRAINT "JailSentence_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JailChatMessage" ADD CONSTRAINT "JailChatMessage_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ambush" ADD CONSTRAINT "Ambush_setterId_fkey" FOREIGN KEY ("setterId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ambush" ADD CONSTRAINT "Ambush_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerActiveExtra" ADD CONSTRAINT "PlayerActiveExtra_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerActiveExtra" ADD CONSTRAINT "PlayerActiveExtra_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "Extra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedAd" ADD CONSTRAINT "ClassifiedAd_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonWinner" ADD CONSTRAINT "SeasonWinner_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonWinner" ADD CONSTRAINT "SeasonWinner_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "ItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
