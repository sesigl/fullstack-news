import Parser from "rss-parser";
import ContentParser from "../../domain/service/ContentParser";
import Article from "../../domain/entity/article/Article";
import {injectable} from "tsyringe";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {CustomItem} from "../../domain/articleSource/entity/CustomItem";
import {CustomFeed} from "../../domain/articleSource/entity/CustomFeed";
import {staticAssetsBasePath} from "../../../configuration";
import {DEFAULT_IMAGE} from "../category/categoryToImageUrlPath";

const url = "https://www.developerway.com/rss.xml"


@injectable()
export default class DeveloperWayParser implements ContentParser {

  constructor(private readonly articleFactory: ArticleFactory) {
  }


  async fetchAllArticles(): Promise<Article[]> {
    const parser: Parser<CustomFeed, CustomItem> = new Parser({
      customFields: {
        item: ['media:content'],
      }
    });

    const feed = await this.parseWith(parser);

    let articles = feed.items.map(item => (
        this.articleFactory.create({
          title: item.title.trim(),
          tags: ['react', 'typescript', 'node', 'monorepos', 'yarn', 'webpack'],
          mlTags: [],
          description: item.contentSnippet ? item.contentSnippet?.trim() : "",
          author: 'Nadia Makarevich',
          link: item.link.trim().replaceAll('\n', '').trim(),
          imageLink: item["enclosure"]?.url ?? staticAssetsBasePath + DEFAULT_IMAGE,
          parsedAt: new Date(Date.parse(item.isoDate)),
          articleSourceId: "articleSourceId"
        })))
    .sort((item1, item2) => item2.parsedAt.getTime() - item1.parsedAt.getTime());
    return articles
  }

  protected async parseWith(parser: Parser<CustomFeed, CustomItem>) {
    return await parser.parseURL(url);
  }

  hasGoodCategories(): boolean {
    return true;
  }
}
