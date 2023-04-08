import {inject, injectable} from "tsyringe";
import type ArticleMlCategoryCockroachRepository
  from "../infrastructure/cockroach/ArticleMlCategoryCockroachRepository";

@injectable()
export default class MlCategoryApplicationService {

  constructor(
      @inject("ArticleMlCategoryRepository") private readonly mlCategoryRepository: ArticleMlCategoryCockroachRepository
  ) {
  }

  getAll(): Promise<string[]> {
    return this.mlCategoryRepository.findAll()
  }

}
