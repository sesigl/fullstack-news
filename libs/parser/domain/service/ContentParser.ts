import Article from "../entity/article/Article";

export default interface ContentParser {
  fetchAllArticles(): Promise<Article[]>

  hasGoodCategories(): boolean
}
