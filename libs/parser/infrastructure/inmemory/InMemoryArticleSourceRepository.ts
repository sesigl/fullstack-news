import ArticleSourceRepository from "../../domain/articleSource/ArticleSourceRepository";
import ArticleSource from "../../domain/articleSource/entity/ArticleSource";
import ParseConfiguration from "../../domain/articleSource/entity/ParseConfiguration";
import DynamicFieldConfiguration
  from "../../domain/articleSource/entity/fieldConfiguration/DynamicFieldConfiguration";
import StaticFieldConfiguration
  from "../../domain/articleSource/entity/fieldConfiguration/StaticFieldConfiguration";
import WhiteListConfiguration from "../../domain/articleSource/entity/WhiteListConfiguration";
import UseExistingCategoryImageFromField
  from "../../domain/articleSource/entity/fieldConfiguration/UseExistingCategoryImageFromField";
import CurateConfiguration from "../../domain/articleSource/entity/CurateConfiguration";
import {injectable} from "tsyringe";

@injectable()
export default class InMemoryArticleSourceRepository implements ArticleSourceRepository {

  public id = 1

  public articleSources = [
    new ArticleSource(
        (this.id++).toString(),
        "https://www.freecodecamp.org/news/rss",
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new DynamicFieldConfiguration('categories'),
            new DynamicFieldConfiguration('content'),
            new DynamicFieldConfiguration("creator"),
            new DynamicFieldConfiguration("media:content.$.url"),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
        ),
        "creatorUserId",
        true
    ),
    new ArticleSource(
        (this.id++).toString(),
        "https://www.smashingmagazine.com/feed",
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new StaticFieldConfiguration([]),
            new DynamicFieldConfiguration('content'),
            new DynamicFieldConfiguration("creator", /\((.*?)\)/),
            new DynamicFieldConfiguration("enclosure.url"),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
        ),
        "creatorUserId",
        true
    ),

    new ArticleSource(
        (this.id++).toString(),
        "https://hackernoon.com/feed",
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new DynamicFieldConfiguration('categories'),
            new DynamicFieldConfiguration('content'),
            new DynamicFieldConfiguration("dc:creator"),
            new DynamicFieldConfiguration("media:thumbnail.$.url", /https:\/\/hackernoon\.com\/(.*)/),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
            [new WhiteListConfiguration("tags", ['programming', 'software-development', 'software-architecture', 'software-engineering', 'javascript', 'web-development', 'serverless', 'kubernetes', 'front-end-development', 'database'])]
        ),
        "creatorUserId",
        true
    ),

    new ArticleSource(
        (this.id++).toString(),
        "https://www.developerway.com/rss.xml",
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new StaticFieldConfiguration(['react', 'typescript', 'node', 'monorepos', 'yarn', 'webpack']),
            new DynamicFieldConfiguration('contentSnippet'),
            new StaticFieldConfiguration('Nadia Makarevich'),
            new DynamicFieldConfiguration("enclosure.url"),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
        ),
        "creatorUserId",
        true
    ),

    new ArticleSource(
        (this.id++).toString(),
        "https://css-tricks.com/feed/",
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new DynamicFieldConfiguration('categories', undefined),
            new DynamicFieldConfiguration('content:encoded', undefined),
            new DynamicFieldConfiguration('dc:creator'),
            new UseExistingCategoryImageFromField('categories'),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
            [new WhiteListConfiguration('tags', ['javascript', 'react', 'vue', 'performance', 'jamstack', 'serverless', 'images', 'flutter', 'server side rendering', 'web components'])],
            [new CurateConfiguration('tags', ['article', 'global scope', 'framework'])]
        ),
        "creatorUserId",
        true
    ),
  ]

  upsertArticleSource(articleSource: ArticleSource): Promise<ArticleSource> {

    this.articleSources = this.articleSources.filter(as => as.id !== articleSource.id)
    this.articleSources.push(articleSource)

    return Promise.resolve(articleSource)
  }

  findAll(): Promise<ArticleSource[]> {
    return Promise.resolve(this.articleSources);
  }

  findAllByUserId(userId: string): Promise<ArticleSource[]> {
    return Promise.resolve(this.articleSources);
  }

  findById(articleSourceId: string): Promise<ArticleSource | undefined> {
    return Promise.resolve(this.articleSources.find(as => as.id === articleSourceId))
  }

  findByRssFeedUrl(rssFeedUrl: string): Promise<ArticleSource | undefined> {
    return Promise.resolve(this.articleSources.find(as => as.rssUrl === rssFeedUrl))
  }

  existsWithRssFeedUrl(rssFeedUrl: string): Promise<boolean> {
    return Promise.resolve(this.articleSources.some(as => as.rssUrl === rssFeedUrl))
  }

}
