import ArticleSource from "./ArticleSource";
import ParseConfiguration from "./ParseConfiguration";
import DynamicFieldConfiguration from "./fieldConfiguration/DynamicFieldConfiguration";
import Parser, {PARSER_CUSTOM_FIELDS} from "../service/Parser";
import {CustomFeed} from "./CustomFeed";
import {CustomItem} from "./CustomItem";
import fs from "fs";
import * as RSSParser from "rss-parser";
import ArticleFactory from "../../entity/article/ArticleFactory";
import FreeCodeCampParser from "../../../infrastructure/parser/FreeCodeCampParser";
import SmashingMagazineParser from "../../../infrastructure/parser/SmashingMagazineParser";
import StaticFieldConfiguration from "./fieldConfiguration/StaticFieldConfiguration";
import HackernoonParser from "../../../infrastructure/parser/HackernoonParser";
import DeveloperWayParser from "../../../infrastructure/parser/DeveloperWayParser";
import CssTricksParser from "../../../infrastructure/parser/CssTricksParser";
import Article from "../../entity/article/Article";
import WhiteListConfiguration from "./WhiteListConfiguration";
import CurateConfiguration from "./CurateConfiguration";
import UseExistingCategoryImageFromField
  from "./fieldConfiguration/UseExistingCategoryImageFromField";

const RELATIVE_PATH = '/../../../../../';
describe("ArticleSource", () => {


  function assertEqualArticles(articlesFromArticleSources: Article[], articlesFromStaticParser: Article[]) {

    expect(articlesFromArticleSources.length).toBe(articlesFromStaticParser.length)

    articlesFromArticleSources.forEach((dynamicArticle, i) => {
      const {
        createdAt: _11,
        updatedAt: _12,
        id: _13,
        description: descriptionFromStatic,
        title: titleFromStatic,
        tags: tagsFromStatic,
        ...partialStaticArticle
      } = articlesFromStaticParser[i]
      const {
        createdAt: _21,
        updatedAt: _22,
        id: _23,
        description: descriptionFromDynamic,
        title: titleFromDynamic,
        tags: tagsFromDynamic,
        ...partialDynamicArticle
      } = articlesFromArticleSources[i]
      expect({...partialDynamicArticle}).toEqual({...partialStaticArticle, articleSourceId: "id1"})

      expect(titleFromDynamic).toEqual(htmlDecode(titleFromStatic))
      expect(tagsFromDynamic).toEqual(tagsFromStatic.map(t => t.replaceAll(" ", '-')))
      expect(descriptionFromStatic.length).toBeGreaterThan(10)
    })
  }

  it("fetches free code camp articles", async () => {

    const articleSource = new ArticleSource(
        "id1",
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
        "creator",
        true
    )

    const localFileArticleSourceParser = new LocalFileArticleSourceParser(
        RELATIVE_PATH + 'tests/libs/parser/freecodecamp/rss.xml'
    )
    let articlesFromArticleSources = await articleSource.parseWith(localFileArticleSourceParser, new ArticleFactory());

    const freeCodeCampParser = new FreeCodeCampParserWithStub(new ArticleFactory());
    const articlesFromStaticParser = await freeCodeCampParser.fetchAllArticles()

    assertEqualArticles(articlesFromArticleSources, articlesFromStaticParser);
  })

  it("fetches smashing magazine articles", async () => {

    let rssUrl = "https://www.smashingmagazine.com/feed";
    const articleSource = new ArticleSource(
        "id1",
        rssUrl,
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new StaticFieldConfiguration([]),
            new DynamicFieldConfiguration('content'),
            new DynamicFieldConfiguration("creator", /\((.*?)\)/),
            new DynamicFieldConfiguration("enclosure.url"),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
        ),
        "creator",
        true
    )

    const localFileArticleSourceParser = new LocalFileArticleSourceParser(
        RELATIVE_PATH + 'tests/libs/parser/smashing-magazine/rss.xml'
    )
    let articlesFromArticleSources = await articleSource.parseWith(localFileArticleSourceParser, new ArticleFactory());

    const smashingMagazineParser = new SmashingMagazineParserWithStub(new ArticleFactory());
    const articlesFromStaticParser = await smashingMagazineParser.fetchAllArticles()

    assertEqualArticles(articlesFromArticleSources, articlesFromStaticParser);
  })

  it("fetches Hackernoon articles", async () => {

    const articleSource = new ArticleSource(
        "id1",
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
        "creator",
        true
    )

    const localFileArticleSourceParser = new LocalFileArticleSourceParser(
        RELATIVE_PATH + 'tests/libs/parser/hackernoon/rss.xml'
    )

    const staticParser = new HackernoonParserWithStub(new ArticleFactory());
    const articlesFromStaticParser = await staticParser.fetchAllArticles()

    let articlesFromArticleSources = await articleSource.parseWith(localFileArticleSourceParser, new ArticleFactory());


    assertEqualArticles(articlesFromArticleSources, articlesFromStaticParser);
  })

  it("fetches DeveloperWay articles", async () => {

    const articleSource = new ArticleSource(
        "id1",
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
        "creator",
        true
    )

    const localFileArticleSourceParser = new LocalFileArticleSourceParser(
        RELATIVE_PATH + 'tests/libs/parser/developer-way/rss.xml'
    )
    let articlesFromArticleSources = await articleSource.parseWith(localFileArticleSourceParser, new ArticleFactory());

    const staticParser = new DeveloperWayParserWithStub(new ArticleFactory());
    const articlesFromStaticParser = await staticParser.fetchAllArticles()

    assertEqualArticles(articlesFromArticleSources, articlesFromStaticParser);
  })

  it("fetches CssTricks articles", async () => {

    const articleSource = new ArticleSource(
        "id1",
        "https://css-tricks.com/feed/",
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new DynamicFieldConfiguration('categories', undefined),
            new DynamicFieldConfiguration('content:encoded', undefined),
            new DynamicFieldConfiguration('dc:creator'),
            new UseExistingCategoryImageFromField('categories'),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
            [new WhiteListConfiguration('tags', ['javascript', 'react', 'vue', 'performance', 'jamstack', 'serverless', 'images', 'flutter', 'server side rendering', 'server-side-rendering', 'web components', 'web-components'])],
            [new CurateConfiguration('tags', ['article', 'global scope', 'global-scope', 'framework'])]
        ),
        "creator",
        true
    )

    const localFileArticleSourceParser = new LocalFileArticleSourceParser(
        RELATIVE_PATH + 'tests/libs/parser/css-tricks/rss.xml'
    )
    let articlesFromArticleSources = await articleSource.parseWith(localFileArticleSourceParser, new ArticleFactory());

    const staticParser = new CssTricksParserWithStub(new ArticleFactory());
    const articlesFromStaticParser = await staticParser.fetchAllArticles()

    assertEqualArticles(articlesFromArticleSources, articlesFromStaticParser);
  })

  class LocalFileArticleSourceParser implements Parser {

    constructor(private relativeFilePath: string) {
    }

    parse(url: string): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      const parser: RSSParser<CustomFeed, CustomItem> = new RSSParser.default({
        customFields: {
          item: PARSER_CUSTOM_FIELDS,
        }
      });

      let xml = fs.readFileSync(module.path + this.relativeFilePath, 'utf8');
      return parser.parseString(xml)
    }
  }

  class FreeCodeCampParserWithStub extends FreeCodeCampParser {

    protected async parseWith(parser: RSSParser<CustomFeed, CustomItem>): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      let xml = fs.readFileSync(module.path + RELATIVE_PATH + 'tests/libs/parser/freecodecamp/rss.xml', 'utf8');
      return parser.parseString(xml)
    }
  }

  class SmashingMagazineParserWithStub extends SmashingMagazineParser {

    protected async parseWith(parser: RSSParser<CustomFeed, CustomItem>): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      let xml = fs.readFileSync(module.path + RELATIVE_PATH + 'tests/libs/parser/smashing-magazine/rss.xml', 'utf8');
      return parser.parseString(xml)
    }
  }

  class HackernoonParserWithStub extends HackernoonParser {

    protected async parseWith(parser: RSSParser<CustomFeed, CustomItem>): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      let xml = fs.readFileSync(module.path + RELATIVE_PATH + 'tests/libs/parser/hackernoon/rss.xml', 'utf8');
      return parser.parseString(xml)
    }
  }

  class DeveloperWayParserWithStub extends DeveloperWayParser {

    protected async parseWith(parser: RSSParser<CustomFeed, CustomItem>): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      let xml = fs.readFileSync(module.path + RELATIVE_PATH + 'tests/libs/parser/developer-way/rss.xml', 'utf8');
      return parser.parseString(xml)
    }
  }

  class CssTricksParserWithStub extends CssTricksParser {

    protected async parseWith(parser: RSSParser<CustomFeed, CustomItem>): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      let xml = fs.readFileSync(module.path + RELATIVE_PATH + 'tests/libs/parser/css-tricks/rss.xml', 'utf8');
      return parser.parseString(xml)
    }
  }

  function htmlDecode(input: string) {
    return input.replaceAll(/&ndash;/g, "–")
  }

});
