import handler, {API_KEY} from "./fetchAndStoreNewArticles";
import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import Article from "../../libs/parser/domain/entity/article/Article";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import ArticleFactory from "../../libs/parser/domain/entity/article/ArticleFactory";
import ArticleRepository from "../../libs/parser/domain/entity/article/ArticleRepository";
import FakeArticleRepository from "../../tests/libs/fakes/FakeArticleRepository";
import StaticAssetUploader from "../../libs/parser/domain/service/StaticAssetUploader";
import ArticleSourceRepository
  from "../../libs/parser/domain/articleSource/ArticleSourceRepository";
import Parser from "../../libs/parser/domain/articleSource/service/Parser";
import {CustomFeed} from "../../libs/parser/domain/articleSource/entity/CustomFeed";
import {CustomItem} from "../../libs/parser/domain/articleSource/entity/CustomItem";
import fs from "fs";
import * as RSSParser from "rss-parser";
import RemoteParser from "../../libs/parser/infrastructure/parser/RemoteParser";
import {mocked} from "jest-mock";
import InMemoryArticleSourceRepository
  from "../../libs/parser/infrastructure/inmemory/InMemoryArticleSourceRepository";
import ArticleSourceCockroachRepository
  from "../../libs/parser/infrastructure/cockroach/ArticleSourceCockroachRepository";
import FakeMetricPublisher from "../../tests/libs/fakes/FakeMetricPublisher";
import CategoryImageCockroachRepository
  from "../../libs/parser/infrastructure/cockroach/CategoryImageCockroachRepository";
import FakeCategoryImageRepository from "../../tests/libs/fakes/FakeCategorylmageRepository";

const RELATIVE_PATH = '/../../';

jest.setTimeout(120000)

describe("fetchAndStoreNewArticles", () => {

  let container = ContainerProvider.getContainerProvider()
  let articleFactory = container.resolve(ArticleFactory)
  let stubStaticAssetUploader: StubStaticAssetUploader

  const ARTICLE_LINK = "https://hackernoon.com/java-program-to-generate-multiplication-table-of-the-input-number?source=rss";
  let ARTICLE: Article;
  let ARTICLE2: Article;

  function createArticleForTest(articleLink = ARTICLE_LINK) {
    return articleFactory.createFromExisting({
      author: "Mayank Vikash",
      createdAt: new Date(" 2022-10-15T09:12:02.580Z"),
      description: "The first method is long and time-consuming whereas the second one needs fewer lines of code but it is not beginners friendly. The second method requires basic knowledge of the while loop. In the first method, the first number is getting printed two times. The first number gets printed if you multiply it by 1, the number itself is printed by 1. The other method uses a while loop to print a multiplication table from 1 to 10 times with an increment.",
      id: "744c2c99-f1ec-4e13-ac77-c99b8cfeeb18",
      imageLink: "https://newUrl/article/744c2c99-f1ec-4e13-ac77-c99b8cfeeb18.jpeg",
      link: articleLink,
      parsedAt: new Date(),
      tags: [
        "java",
        "programming",
        "learning",
        "tutorial",
        "learning-to-code",
        "learn-java",
        "mathematics",
        "mathematics-and-programming",
      ],
      mlTags: [],
      title: "Java Program to Generate Multiplication Table of the Input Number",
      updatedAt: new Date(),
      articleSourceId: "articleSourceId"
    });
  }

  let repository: ArticleRepository;
  let parser: StubParser;
  let metricPublisher: FakeMetricPublisher
  let articleRepository: InMemoryArticleSourceRepository


  let request: NextApiRequest
  let response: NextApiResponse

  beforeEach(() => {
    ARTICLE = createArticleForTest()
    ARTICLE2 = createArticleForTest("https://www.freecodecamp.org/news/article2")

    request = {
      query: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    container.reset()
    articleRepository = new InMemoryArticleSourceRepository();
    container.register("ArticleSourceRepository", {useValue: articleRepository})

    // @ts-ignore
    container.register(CategoryImageCockroachRepository, {useValue: new FakeCategoryImageRepository()})

    // @ts-ignore
    container.register(ArticleSourceCockroachRepository, {useValue: articleRepository})

    parser = new StubParser();
    container.register("Parser", {useValue: parser})

    stubStaticAssetUploader = new StubStaticAssetUploader();
    container.register("StaticAssetUploader", {useValue: stubStaticAssetUploader})

    repository = new FakeArticleRepository();
    container.register("ArticleRepository", {useValue: repository})

    metricPublisher = new FakeMetricPublisher();
    container.register("MetricPublisher", {useValue: metricPublisher})
  })

  it("returns 40x when no or wrong key parameter given", async () => {
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalled()
  })

  it("returns 20x when correct key is given", async () => {
    request.query.key = API_KEY
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(mocked(response.json).mock.calls[0][0].length).toBe(3)
    expect(mocked(response.json).mock.calls[0][0][0].title).toBe("Java Program to Generate Multiplication Table of the Input Number")
  })

  it("stores no new articles in db when api key is wrong", async () => {
    request.query.key = "abc"

    await handler(request, response)
    let storedArticles = await repository.findByLink(ARTICLE_LINK);
    expect(storedArticles).toHaveLength(0)
  })

  it("stores new articles in db", async () => {
    request.query.key = API_KEY

    await handler(request, response)
    let storedArticles = await repository.findByLink(ARTICLE_LINK);
    expect(storedArticles).toHaveLength(1)
  })

  it("uploads the image and uses the new link in the article itself", async () => {
    request.query.key = API_KEY

    await handler(request, response)

    expect(stubStaticAssetUploader.calls[0].url).toBe(
        "https://cdn.hackernoon.com/images/ysXQQ2Q709W60Kk4TrKE20Gjeam2-mg93rd3.jpeg"
    )

    let storedArticles = await repository.findByLink(ARTICLE_LINK);

    expect(storedArticles[0].imageLink).toContain(`https://newUrl/article/`)
    expect(storedArticles[0].imageLink).toContain(`.jpeg`)
  })

  it("inserts all articles by default", async () => {
    request.query.key = API_KEY
    articleRepository = new InMemoryArticleSourceRepository()

    await handler(request, response)

    let storedArticles = await repository.findAll();

    expect(storedArticles).toHaveLength(3)
  })

  it("inserts only 1 article if requested but keeps going one by one", async () => {
    request.query.key = API_KEY
    request.query.limit = "1"

    await handler(request, response)

    let storedArticles = await repository.findAll();

    expect(storedArticles).toHaveLength(1)
    expect(metricPublisher.increments[1].key).toBe('article.skip')
    expect(metricPublisher.increments[1].increment).toBe(1)

    await handler(request, response)

    let storedArticles2 = await repository.findAll();
    expect(storedArticles2).toHaveLength(2)
  })

  it("skips not approved article sources", async () => {
    articleRepository.articleSources.forEach(as => as.approved = false)

    await handler(request, response)

    let storedArticles = await repository.findAll();
    expect(storedArticles).toHaveLength(0)
  })

  it("increments counter for new article", async () => {
    request.query.key = API_KEY

    await handler(request, response)

    expect(metricPublisher.increments[0].key).toBe('article.insert')
    expect(metricPublisher.increments[0].increment).toBe(1)

    await handler(request, response)

    expect(metricPublisher.increments.length).toBe(3)
  })

  class StubParser implements Parser {
    parse(url: String): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
      let xml = fs.readFileSync(module.path + RELATIVE_PATH + 'tests/libs/parser/hackernoon/rss.xml', 'utf8');
      return RemoteParser.parser.parseString(xml)
    }
  }

  class StubStaticAssetUploader implements StaticAssetUploader {
    calls: { url: string, targetPath: string }[] = []

    uploadFromUrl(url: string, targetPath: string): Promise<string> {
      this.calls.push({url, targetPath})
      return Promise.resolve("https://newUrl/" + targetPath);
    }
  }

})
