import CategoryImageCockroachRepository
  from "../../../libs/parser/infrastructure/cockroach/CategoryImageCockroachRepository";
import CategoryImage from "../../../libs/parser/domain/entity/categoryImage/CategoryImage";

export default class FakeCategoryImageRepository extends CategoryImageCockroachRepository {

  async syncCategoryImages(categoryImages: string[]): Promise<void> {
    return
  }

  async find(name: string): Promise<CategoryImage | undefined> {
    return undefined;
  }
}
