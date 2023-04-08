import ArticleRepository from "../../../libs/parser/domain/entity/article/ArticleRepository";
import Article from "../../../libs/parser/domain/entity/article/Article";
import ArticleFactory from "../../../libs/parser/domain/entity/article/ArticleFactory";
import ArticleWithRelations from "../../../libs/parser/domain/entity/article/ArticleWithRelations";

export default class FakeArticleRepository implements ArticleRepository {
  findByArticleId(articleId: string): Promise<Article | undefined> {
    const article: Article | undefined = this.articles.find(existingArticle => existingArticle.id === articleId);

    if (article) {
      return Promise.resolve(this.cloneArticle(article))
    } else {
      return Promise.resolve(undefined)
    }
  }

  articles: Article[] = []

  findByLink(link: string): Promise<Article[]> {
    return Promise.resolve(this.articles.filter(article => article.link === link).map(a => this.cloneArticle(a)));
  }

  insert(article: Article): Promise<Article> {

    let existingIndex = this.articles.findIndex((existingArticle) => existingArticle.id === article.id);

    if (existingIndex !== -1) {
      throw new Error(`Article ${article.id} already exists`)
    } else {
      this.articles.push(this.cloneArticle(article))
    }

    return Promise.resolve(article);
  }

  private cloneArticle(article: Article) {
    return new ArticleFactory().createFromExisting({
      ...article,
      mlTags: [],
    });
  }

  findAll(): Promise<Article[]> {
    return Promise.resolve(this.articles);
  }

  findAllWithRelations(): Promise<ArticleWithRelations[]> {
    return Promise.resolve(this.articles.map(a => (new ArticleWithRelations(
        a.id,
        a.createdAt,
        a.updatedAt,
        a.title,
        a.description,
        a.author,
        a.link,
        a.imageLink,
        a.parsedAt,
        a.tags,
        [],
        [],
        a.articleSourceId,
        []
    ))));
  }

}
