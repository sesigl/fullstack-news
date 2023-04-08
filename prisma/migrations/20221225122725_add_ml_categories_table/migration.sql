-- CreateTable
CREATE TABLE "ArticleMlCategory" (
    "ml_category_check" STRING NOT NULL,
    "article_category" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleMlCategory_pkey" PRIMARY KEY ("ml_category_check")
);
