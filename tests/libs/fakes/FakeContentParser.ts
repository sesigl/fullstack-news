import ContentParser from "../../../libs/parser/domain/service/ContentParser";
import Article from "../../../libs/parser/domain/entity/article/Article";

export default class FakeContentParser implements ContentParser {

  public articles: Article[] = []

  fetchAllArticles(): Promise<Article[]> {
    return Promise.resolve([...this.articles]);
  }

  hasGoodCategories(): boolean {
    return false;
  }
}
