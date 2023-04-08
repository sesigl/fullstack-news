import handler from "./removeVote";
import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import ContentParser from "../../libs/parser/domain/service/ContentParser";
import Article from "../../libs/parser/domain/entity/article/Article";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import ArticleFactory from "../../libs/parser/domain/entity/article/ArticleFactory";
import ArticleRepository from "../../libs/parser/domain/entity/article/ArticleRepository";
import DatadogMetricPublisher
  from "../../libs/parser/infrastructure/metrics/DatadogMetricPublisher";
import {setCookieFacadeOverride} from "./id";
import {setCookieFacadeOverride as setCookieFacadeOverrideInAuth} from "../../libs/api/auth";
import FakeCookieFacade from "../../tests/libs/fakes/FakeCookieFacade";
import FakeJwtTokenFacade from "../../tests/libs/fakes/FakeJwtTokenFacade";
import JwtTokenFacade from "../../libs/parser/infrastructure/jwt/JwtTokenFacade";
import FakeArticleRepository from "../../tests/libs/fakes/FakeArticleRepository";
import FakeVoteRepository from "../../tests/libs/fakes/FakeVoteRepository";
import Vote from "../../libs/parser/domain/entity/vote/Vote";

function createArticle(articleFactory: ArticleFactory, ARTICLE_LINK: string) {
  return articleFactory.createFromExisting({
    author: "author",
    createdAt: new Date(),
    description: "description",
    id: "id",
    imageLink: "imageLink",
    link: ARTICLE_LINK,
    parsedAt: new Date(),
    tags: [],
    mlTags: [],
    title: "title",
    updatedAt: new Date(),
    articleSourceId: "articleSource"
  });
}

describe("removeVote", () => {

  let container = ContainerProvider.getContainerProvider()
  let articleFactory = container.resolve(ArticleFactory)

  const ARTICLE_LINK = "link";

  let ARTICLE: Article

  let articleRepository: FakeArticleRepository;
  let voteRepository: FakeVoteRepository;
  let datadogMetricPublisher: DatadogMetricPublisher

  let request: NextApiRequest
  let response: NextApiResponse

  let fakeCookieFacade: FakeCookieFacade
  let jwtTokenFacade: FakeJwtTokenFacade

  let beforeConsoleError: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }

  beforeEach(() => {

    ARTICLE = createArticle(articleFactory, ARTICLE_LINK);

    request = {
      query: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    // container.reset()
    container.register("ContentParser", {useValue: new StubContentParser()})
    articleRepository = new FakeArticleRepository();
    container.register("ArticleRepository", {useValue: articleRepository})

    voteRepository = new FakeVoteRepository();
    container.register("VoteRepository", {useValue: voteRepository})

    datadogMetricPublisher = new DatadogMetricPublisher();
    jest.spyOn(datadogMetricPublisher, 'incrementCounter')
    container.register("MetricPublisher", {useValue: datadogMetricPublisher})

    fakeCookieFacade = new FakeCookieFacade();
    setCookieFacadeOverride(fakeCookieFacade)
    setCookieFacadeOverrideInAuth(fakeCookieFacade)

    jwtTokenFacade = new FakeJwtTokenFacade();
    container.register(JwtTokenFacade, {useValue: jwtTokenFacade})

    beforeConsoleError = console.error
    console.error = jest.fn()

    articleRepository.articles = []

  })

  afterEach(() => {
    console.error = beforeConsoleError
  })

  it("returns 40x when no jwt token is given", async () => {
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalled()
  })

  describe("existing jwt token", () => {

    beforeEach(() => {
      jwtTokenFacade.verifyResult = true
      fakeCookieFacade.set("jwt", "myToken")

      jwtTokenFacade.signedData = {
        visitorId: "test-visitor-id",
        requestId: "test-request-id"
      }
      articleRepository.insert(ARTICLE)
      voteRepository.addVote(Vote.createUpVote("test-visitor-id", ARTICLE.id))
    })


    it("removes a new vote", async () => {
      request.body = {
        articleId: ARTICLE.id
      }

      await handler(request, response)

      expect(voteRepository.votes.length).toBe(0)
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('votes.decrease', 1)
    })

    it("returns 500 and throws error when no votes exist", async () => {
      request.body = {
        articleId: ARTICLE.id
      }

      await handler(request, response)
      await handler(request, response)

      expect(response.status).toHaveBeenNthCalledWith(2, 500)
      expect(console.error).toHaveBeenCalledWith(new Error("test-visitor-id visitor has not voted for id"))
    })

    it("returns 404 for unknown article", async () => {
      request.body = {
        articleId: "123"
      }

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(404)
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('votes.notFound', 1)
    })

  })

  class StubContentParser implements ContentParser {
    fetchAllArticles(): Promise<Article[]> {
      return Promise.resolve([ARTICLE]);
    }

    hasGoodCategories(): boolean {
      return false;
    }
  }

})
