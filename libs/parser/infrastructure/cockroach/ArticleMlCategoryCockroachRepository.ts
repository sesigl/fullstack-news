import {PrismaClient} from '@prisma/client'
import {injectable} from "tsyringe";

export interface ArticleMlCategoryMapping { ml_category_check: string; category: string }

@injectable()
export default class ArticleMlCategoryCockroachRepository {

  constructor(private readonly prisma: PrismaClient) {
  }

  async findAll(): Promise<string[]> {

    let categories = await this.prisma.articleMlCategory.findMany();
    let mlCategories = categories
      .map(category => category.article_category)
      .sort()

    return Array.from(new Set(mlCategories))
  }

  async syncCategories(categoryImages: ArticleMlCategoryMapping[]): Promise<void> {
    await this.prisma.articleMlCategory.deleteMany();

    await this.prisma.articleMlCategory.createMany({
      data: categoryImages.map(ci => ({
        ml_category_check: ci.ml_category_check,
        article_category: ci.category,
      }))
    })
  }

}
