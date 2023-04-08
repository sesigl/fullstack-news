import {inject, injectable, injectAll} from "tsyringe";
import ContentParser from "../domain/service/ContentParser";
import type ArticleRepository from "../domain/entity/article/ArticleRepository";
import Article from "../domain/entity/article/Article";
import ArticleWithRelations from "../domain/entity/article/ArticleWithRelations";
import type MetricPublisher from "../domain/service/MetricPublisher";
import SortMode from "../../interfaces/SortMode";
import {getSortedPostsForArticles} from "../../getPosts";
import Post from "../../interfaces/viewModels/Post";

@injectable()
export default class GetArticlesApplicationServices {

  constructor(
      @injectAll("ContentParser") private readonly contentParsers: ContentParser[],
      @inject("ArticleRepository") private readonly articleRepository: ArticleRepository,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher) {
  }

  getAllArticles(): Promise<Article[]> {
    return this.articleRepository.findAll()
  }

  async getAllArticlesWithRelations(): Promise<ArticleWithRelations[]> {
    let articleWithRelations = await this.articleRepository.findAllWithRelations();

    articleWithRelations.forEach(a => {
      a.challenges = a.challenges.filter(a => a.approved)
    })

    return articleWithRelations
  }

  async getArticlesConsideringFavoriteCategories(favoriteCategories: string[], sort: SortMode, userId: string): Promise<Post[]> {
    const articles = (await this.articleRepository.findAllWithRelations())
    .filter(a => this.isCategoryMatch(a.tags, favoriteCategories))
    return await getSortedPostsForArticles(articles, sort, userId);
  }

  private isCategoryMatch(tags: string[], favoriteCategories: string[]) {
    const lowerCaseTags = tags.map(t => t.toLowerCase())
    const lowerCaseFavorites = favoriteCategories.map(f => f.toLowerCase())
    return lowerCaseTags.some(t => lowerCaseFavorites.includes(t))
  }
}
