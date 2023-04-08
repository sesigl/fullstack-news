-- CreateTable
CREATE TABLE "ArticleSource" (
    "id" STRING NOT NULL,
    "rssUrl" STRING NOT NULL,
    "creatorUserId" STRING NOT NULL,
    "approved" BOOL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastParsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicFieldConfiguration" (
    "id" STRING NOT NULL,
    "fieldName" STRING NOT NULL,
    "objectPath" STRING NOT NULL,
    "extractRegExp" STRING,
    "articleSourceId" STRING NOT NULL,

    CONSTRAINT "DynamicFieldConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaticFieldConfiguration" (
    "id" STRING NOT NULL,
    "fieldName" STRING NOT NULL,
    "value" STRING NOT NULL,
    "articleSourceId" STRING NOT NULL,

    CONSTRAINT "StaticFieldConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UseExistingCategoryImageFromField" (
    "id" STRING NOT NULL,
    "fieldName" STRING NOT NULL,
    "objectPath" STRING NOT NULL,
    "articleSourceId" STRING NOT NULL,

    CONSTRAINT "UseExistingCategoryImageFromField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSource_rssUrl_key" ON "ArticleSource"("rssUrl");

-- AddForeignKey
ALTER TABLE "DynamicFieldConfiguration" ADD CONSTRAINT "DynamicFieldConfiguration_articleSourceId_fkey" FOREIGN KEY ("articleSourceId") REFERENCES "ArticleSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaticFieldConfiguration" ADD CONSTRAINT "StaticFieldConfiguration_articleSourceId_fkey" FOREIGN KEY ("articleSourceId") REFERENCES "ArticleSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseExistingCategoryImageFromField" ADD CONSTRAINT "UseExistingCategoryImageFromField_articleSourceId_fkey" FOREIGN KEY ("articleSourceId") REFERENCES "ArticleSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
