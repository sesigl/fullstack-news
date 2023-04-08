import handler from "./hasVoted";
import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
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
import Vote from "../../libs/parser/domain/entity/vote/Vote";
import FakeVoteRepository from "../../tests/libs/fakes/FakeVoteRepository";

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
    articleSourceId: "articleSourceId"
  });
}

describe("hasVoted", () => {

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
    })


    it("returns false when not voted", async () => {
      request.body = {
        articleId: [ARTICLE.id]
      }

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith([{
        articleId: ARTICLE.id,
        hasVoted: false,
        voteCount: 0
      }])
    })

    it("returns true if already voted, works for multiple", async () => {
      request.body = {
        articleId: [ARTICLE.id, 99]
      }

      await voteRepository.addVote(new Vote(new Date(), 1, "test-visitor-id", ARTICLE.id))

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.json).toHaveBeenCalledWith([{
        articleId: ARTICLE.id,
        hasVoted: true,
        voteCount: 1
      }, {
        articleId: 99,
        hasVoted: false,
        voteCount: 0
      }])
    })


  })

})
