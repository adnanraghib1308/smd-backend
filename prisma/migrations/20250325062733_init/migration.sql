-- CreateTable
CREATE TABLE "Contest" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "contestImage" TEXT NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" UUID NOT NULL,
    "contestId" UUID NOT NULL,
    "babyName" TEXT NOT NULL,
    "babyDob" TIMESTAMP(3) NOT NULL,
    "babyGender" VARCHAR(10) NOT NULL,
    "babyImage" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentContactNumber" VARCHAR(15) NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "cookieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_cookieId_key" ON "Vote"("cookieId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_participantId_cookieId_key" ON "Vote"("participantId", "cookieId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
