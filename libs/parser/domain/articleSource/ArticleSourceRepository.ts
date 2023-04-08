import ArticleSource from "./entity/ArticleSource";

export default interface ArticleSourceRepository {

  findAll(): Promise<ArticleSource[]>

  findAllByUserId(userId: string): Promise<ArticleSource[]>;

  existsWithRssFeedUrl(rssFeedUrl: string): Promise<boolean>;

  findByRssFeedUrl(rssFeedUrl: string): Promise<ArticleSource | undefined>;

  upsertArticleSource(articleSource: ArticleSource): Promise<ArticleSource>

  findById(articleSourceId: string): Promise<ArticleSource | undefined>;
}
