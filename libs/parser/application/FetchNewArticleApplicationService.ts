import type ArticleRepository from "../domain/entity/article/ArticleRepository";
import {inject, injectable} from "tsyringe";
import Article from "../domain/entity/article/Article";
import type StaticAssetUploader from "../domain/service/StaticAssetUploader";
import path from "path";
import type MetricPublisher from "../domain/service/MetricPublisher";
import type ArticleSourceRepository from "../domain/articleSource/ArticleSourceRepository";
import ArticleFactory from "../domain/entity/article/ArticleFactory";
import type Parser from "../domain/articleSource/service/Parser";
import {CreateArticleSourceCommand} from "../../interfaces/commands/CreateArticleSourceCommand";
import ArticleSourceFactory from "../domain/articleSource/ArticleSourceFactory";
import RemoteParser from "../infrastructure/parser/RemoteParser";
import {getPaths} from "../../../components/article-sources/ArticleSourceForm";
import {CustomFeed} from "../domain/articleSource/entity/CustomFeed";
import {CustomItem} from "../domain/articleSource/entity/CustomItem";
import _ from "lodash";
import * as RSSParser from "rss-parser";
import InMemoryArticleSourceRepository
  from "../infrastructure/inmemory/InMemoryArticleSourceRepository";
import isProduction from "../infrastructure/vercel/environment/isProduction";

@injectable()
export default class FetchNewArticleApplicationService {

  constructor(
      @inject("ArticleRepository") private readonly articleRepository: ArticleRepository,
      @inject(ArticleFactory) private readonly articleFactory: ArticleFactory,
      @inject(ArticleSourceFactory) private readonly articleSourceFactory: ArticleSourceFactory,
      @inject("Parser") private readonly parser: Parser,
      @inject("ArticleSourceRepository") private readonly articleSourceRepository: ArticleSourceRepository,
      @inject(InMemoryArticleSourceRepository) private readonly inMemoryArticleSourceRepository: InMemoryArticleSourceRepository,
      @inject("StaticAssetUploader") private readonly staticAssetUploader: StaticAssetUploader,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher,) {
  }

  async fetchAndStoreNewArticles(limit = 0): Promise<Article[]> {
    let articleSources = (await this.articleSourceRepository.findAll())
    .filter(as => as.approved)

    if (!isProduction()) {
      articleSources.push(...await this.inMemoryArticleSourceRepository.findAll());
    }

    const articleResults = await Promise.all(articleSources.map(as => as.parseWith(this.parser, this.articleFactory)))
    const articles = articleResults.flat()

    const insertedArticles: Article[] = []
    let count = 0
    for (const article of articles) {
      let existingArticle = await this.articleRepository.findByLink(article.link);

      if (existingArticle.length === 0) {

        article.imageLink = await this.staticAssetUploader.uploadFromUrl(article.imageLink, `article/` + article.id + path.extname(article.imageLink))

        await this.articleRepository.insert(article)

        await this.metricPublisher.incrementCounter('article.insert', 1)

        insertedArticles.push(article)

        if (limit > 0 && ++count >= limit) {
          await this.metricPublisher.incrementCounter('article.skip', 1)
          break
        }
      }
    }

    return insertedArticles
  }

  async parseArticleSource(createArticleSourceCommand: CreateArticleSourceCommand): Promise<Article[]> {
    const articleSource = this.articleSourceFactory.create(createArticleSourceCommand, "preview", false)
    return await articleSource.parseWith(new RemoteParser(), new ArticleFactory())
  }

  async parseRssFeedItemKeyAndValues(rssFeedUrl: string): Promise<Record<string, string>> {

    const remoteParser = new RemoteParser()
    const parseResult = await remoteParser.parse(rssFeedUrl)

    const result: Record<string, string> = {}

    if (parseResult?.items && parseResult?.items[0]) {
      let availableObjectPaths = getPaths(parseResult.items[0]);
      availableObjectPaths = availableObjectPaths.sort()


      availableObjectPaths.forEach(objectPath => {
        result[objectPath] = this.shortenExampleValueContent(parseResult, objectPath)
      })
    }

    return result;
  }

  private shortenExampleValueContent(parseResult: CustomFeed & RSSParser.Output<CustomItem>, objectPath: string) {
    return (
        // .slice(0, 40)
        JSON.stringify(_.get(parseResult.items[0], objectPath))
        .replaceAll(/\n/g, "")
        .replaceAll("\\n", "")
        .replaceAll("[", "")
        .replaceAll("]", "")
        .replaceAll(/"/g, "")
        .trim()
    );
  }
}
