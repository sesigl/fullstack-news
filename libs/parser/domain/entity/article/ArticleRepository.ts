import Article from "./Article";
import ArticleWithRelations from "./ArticleWithRelations";

export default interface ArticleRepository {

  findByLink(link: string): Promise<Article[]>

  insert(article: Article): Promise<Article>

  findAll(): Promise<Article[]>

  findAllWithRelations(): Promise<ArticleWithRelations[]>

  findByArticleId(articleId: string): Promise<Article | undefined>;
}
