import { PrismaClient, CategoryImage as CategoryImagePO } from '@prisma/client'
import { injectable } from "tsyringe";
import CategoryImage from "../../domain/entity/categoryImage/CategoryImage";

@injectable()
export default class CategoryImageCockroachRepository {

  constructor(private readonly prisma: PrismaClient) {
  }

  async syncCategoryImages(categoryImages: string[]): Promise<void> {
    let createdCategoryImage = await this.prisma.categoryImage.findMany({
      where: {
        name: {
          in: categoryImages
        }
      }
    });

    const existingImages = createdCategoryImage.map(c => c.name)

    const notExistingImages = categoryImages.filter(ci => !existingImages.includes(ci))
    
    console.log('notExistingImages', notExistingImages)

    const posToBeCreated: CategoryImagePO[] = notExistingImages.map( (nei => ({"name": nei})))

    await this.prisma.categoryImage.createMany({
      data: posToBeCreated
    })
  }

  async find(name: string): Promise<CategoryImage | undefined> {
    const categoryImagePO = await this.prisma.categoryImage.findUnique({
      where: {
        name: name
      }
    })
    return categoryImagePO ? this.poToEntity(categoryImagePO) : undefined;
  }

  private poToEntity(categoryImagePO: CategoryImagePO) {
    return new CategoryImage(categoryImagePO.name);
  }

}
