import Parser from "rss-parser";
import ContentParser from "../../domain/service/ContentParser";
import Article from "../../domain/entity/article/Article";
import {injectable} from "tsyringe";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {CustomFeed} from "../../domain/articleSource/entity/CustomFeed";
import {CustomItem} from "../../domain/articleSource/entity/CustomItem";

const url = "https://www.smashingmagazine.com/feed"

@injectable()
export default class SmashingMagazineParser implements ContentParser {

  constructor(private readonly articleFactory: ArticleFactory) {
  }

  async fetchAllArticles(): Promise<Article[]> {
    const parser: Parser<CustomFeed, CustomItem> = new Parser({
      customFields: {
        item: ['media:content'],
      }
    });

    const feed = await this.parseWith(parser);

    return feed.items.map(item => {
      let authorInBracesMatchResult = item.creator.trim().match(/\((.*?)\)/);
      return (
          this.articleFactory.create({
            title: this.clean(item.title),
            tags: [],
            mlTags: [],
            description: item.content ? this.clean(item.content?.trim()) : "",
            author: (authorInBracesMatchResult ? authorInBracesMatchResult[1] : ""),
            link: this.clean(item.link),
            imageLink: item.enclosure?.url ?? "",
            parsedAt: new Date(Date.parse(item.isoDate)),
            articleSourceId: "articleSourceId"
          }));
    })
    .sort((item1, item2) => item2.parsedAt.getTime() - item1.parsedAt.getTime())
  }

  private clean(title: string) {
    return title.replaceAll('\n', '').trim();
  }

  protected async parseWith(parser: Parser<CustomFeed, CustomItem>) {
    return await parser.parseURL(url);
  }

  hasGoodCategories(): boolean {
    return false;
  }
}
