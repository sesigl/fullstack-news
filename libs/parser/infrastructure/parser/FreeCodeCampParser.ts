import Parser from "rss-parser";
import ContentParser from "../../domain/service/ContentParser";
import Article from "../../domain/entity/article/Article";
import {injectable} from "tsyringe";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {CustomItem} from "../../domain/articleSource/entity/CustomItem";
import {CustomFeed} from "../../domain/articleSource/entity/CustomFeed";

const url = "https://www.freecodecamp.org/news/rss"


@injectable()
export default class FreeCodeCampParser implements ContentParser {

  constructor(private readonly articleFactory: ArticleFactory) {
  }


  async fetchAllArticles(): Promise<Article[]> {
    const parser: Parser<CustomFeed, CustomItem> = new Parser({
      customFields: {
        item: ['media:content'],
      }
    });

    const feed = await this.parseWith(parser);

    return feed.items.map(item => (
        this.articleFactory.create({
          title: item.title.trim(),
          tags: item.categories.map(cat => cat.trim()).filter(tag => tag !== ""),
          mlTags: [],
          description: item.content ? item.content?.trim() : "",
          author: item.creator.trim(),
          link: item.link,
          imageLink: item["media:content"].$.url,
          parsedAt: new Date(Date.parse(item.isoDate)),
          articleSourceId: "articleSourceId"
        })))
    .sort((item1, item2) => item2.parsedAt.getTime() - item1.parsedAt.getTime())
  }

  protected async parseWith(parser: Parser<CustomFeed, CustomItem>) {
    return await parser.parseURL(url);
  }

  hasGoodCategories(): boolean {
    return true;
  }
}
