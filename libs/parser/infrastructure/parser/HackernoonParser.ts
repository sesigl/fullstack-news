import Parser from "rss-parser";
import ContentParser from "../../domain/service/ContentParser";
import Article from "../../domain/entity/article/Article";
import {injectable} from "tsyringe";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {CustomFeed} from "../../domain/articleSource/entity/CustomFeed";
import {CustomItem} from "../../domain/articleSource/entity/CustomItem";

const url = "https://hackernoon.com/feed"
const whiteListCategories = ['programming', 'software-development', 'software-architecture', 'software-engineering', 'javascript', 'web-development', 'serverless', 'kubernetes', 'front-end-development', 'database']


@injectable()
export default class HackernoonParser implements ContentParser {

  constructor(private readonly articleFactory: ArticleFactory) {
  }

  async fetchAllArticles(): Promise<Article[]> {
    const parser: Parser<CustomFeed, CustomItem> = new Parser({
      customFields: {
        item: ['dc:creator', 'media:thumbnail'],
      }
    });

    const feed = await this.parseWith(parser);

    let feedItems: typeof feed.items = [];

    if (feed.items) {
      feedItems = feed.items
    } else {
      console.error("HackerNoon Parser no items returned, we might be blocked.")
    }

    let articles = feedItems
    .filter(item => {
      let categories = item.categories ?? [];
      return categories.some(c => whiteListCategories.includes(c.toLowerCase()));
    })
    .map(item => {
      let authorInBracesMatchResult = item["dc:creator"]
      return (
          this.articleFactory.create({
            title: this.clean(item.title),
            tags: item.categories,
            mlTags: [],
            description: item.content ? this.clean(item.content?.trim()) : "",
            author: (authorInBracesMatchResult ? authorInBracesMatchResult : ""),
            link: this.clean(item.link),
            imageLink: item["media:thumbnail"]?.$?.url ? item["media:thumbnail"].$.url.replace('https://hackernoon.com/', '') : "",
            parsedAt: new Date(Date.parse(item.isoDate)),
            articleSourceId: "articleSourceId"
          }));
    })
    .sort((item1, item2) => item2.parsedAt.getTime() - item1.parsedAt.getTime());

    return articles
  }

  private clean(title: string) {
    return title.replaceAll('\n', '').trim();
  }

  protected async parseWith(parser: Parser<CustomFeed, CustomItem>) {
    return await parser.parseURL(url);
  }

  hasGoodCategories(): boolean {
    return true;
  }
}
