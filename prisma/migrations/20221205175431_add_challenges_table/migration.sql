-- CreateTable
CREATE TABLE "Challenge" (
    "id" STRING NOT NULL,
    "challengeName" STRING NOT NULL,
    "description" STRING NOT NULL,
    "goal" STRING NOT NULL,
    "programmingLanguage" STRING NOT NULL,
    "testCode" STRING NOT NULL,
    "exampleSolution" STRING NOT NULL,
    "templateSolution" STRING NOT NULL,
    "approved" BOOL NOT NULL,
    "creatorUserId" STRING,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleToChallenge" (
    "A" STRING NOT NULL,
    "B" STRING NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArticleToChallenge_AB_unique" ON "_ArticleToChallenge"("A", "B");

-- CreateIndex
CREATE INDEX "_ArticleToChallenge_B_index" ON "_ArticleToChallenge"("B");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToChallenge" ADD CONSTRAINT "_ArticleToChallenge_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToChallenge" ADD CONSTRAINT "_ArticleToChallenge_B_fkey" FOREIGN KEY ("B") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
