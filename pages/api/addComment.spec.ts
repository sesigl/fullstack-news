import handler from "./addComment";
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
import FakeCommentRepository from "../../tests/libs/fakes/FakeCommentRepository";
import AlgoliaManageDataClient
  from "../../libs/parser/infrastructure/algolia/AlgoliaManageDataClient";
import FakeAlgoliaManageDataClientFactory
  from "../../tests/libs/fakes/FakeAlgoliaManageDataClientFactory";
import * as auth0 from "@auth0/nextjs-auth0";
import FakeUserRepository from "../../tests/libs/fakes/FakeUserRepository";
import UserFactory from "../../libs/parser/domain/entity/user/UserFactory";
import User from "../../libs/parser/domain/entity/user/User";

jest.mock("../../libs/parser/infrastructure/algolia/AlgoliaManageDataClient")
jest.setTimeout(10000)

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

describe("addComment", () => {

  let container = ContainerProvider.getContainerProvider()
  let articleFactory = container.resolve(ArticleFactory)

  const ARTICLE_LINK = "link";

  let ARTICLE: Article
  let USER: User

  let articleRepository: FakeArticleRepository;
  let commentRepository: FakeCommentRepository;
  let datadogMetricPublisher: DatadogMetricPublisher
  let userRepository: FakeUserRepository;

  let request: NextApiRequest
  let response: NextApiResponse

  let fakeCookieFacade: FakeCookieFacade
  let jwtTokenFacade: FakeJwtTokenFacade
  let algoliaManageDataClientMock: AlgoliaManageDataClient

  let beforeConsoleError: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }

  beforeEach(() => {
    ARTICLE = createArticle(articleFactory, ARTICLE_LINK);
    USER = new UserFactory().createFromExisting({
      id: "userId",
      auth0Id: "auth0Id", displayName: "displayName", email: "email",
    }, {allowNewsletter: true, favoriteCategories: []});

    request = {
      query: {},
      headers: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    // container.reset()
    container.register("ContentParser", {useValue: new StubContentParser()})

    algoliaManageDataClientMock = FakeAlgoliaManageDataClientFactory.createAlgoliaMock()
    container.register(AlgoliaManageDataClient, {useValue: algoliaManageDataClientMock})

    articleRepository = new FakeArticleRepository();
    container.register("ArticleRepository", {useValue: articleRepository})

    userRepository = new FakeUserRepository();
    container.register("UserRepository", {useValue: userRepository})

    commentRepository = new FakeCommentRepository();
    container.register("CommentRepository", {useValue: commentRepository})

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
    userRepository.users = [USER]

    mockNoSession()
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

    it("returns 400 when no message", async () => {
      request.body = {
        articleId: ARTICLE.id,
      }

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(400)
      expect(response.send).toHaveBeenCalled()
    })

    it("adds a new comment", async () => {
      request.body = {
        articleId: ARTICLE.id,
        message: "message",
      }

      await handler(request, response)

      expect(commentRepository.comments.length).toBe(1)
      expect(commentRepository.comments[0].userId).toBe(undefined)
      expect(commentRepository.comments[0].visitorId).toBe("test-visitor-id")
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('comments.increment', 1)
      expect(algoliaManageDataClientMock.incrementArticleCommentCount).toHaveBeenCalledWith(ARTICLE.id)
    })

    it("adds a new comment for logged in users", async () => {
      request.body = {
        articleId: ARTICLE.id,
        message: "message",
      }
      mockValidSession(USER.auth0Id)

      await handler(request, response)

      expect(commentRepository.comments[0].userId).toBe(USER.id)
    })

    it("shows not existing users as guest", async () => {
      request.body = {
        articleId: ARTICLE.id,
        message: "message",
      }
      mockValidSession("doesNotExist")

      await handler(request, response)

      expect(commentRepository.comments[0].userId).toBe(undefined)
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('comments.notExistingUser', 1)
    })

    it("returns 500 after 5 messages from the same visitor", async () => {
      request.body = {
        articleId: ARTICLE.id,
        message: "message",
      }

      await handler(request, response)
      await handler(request, response)
      await handler(request, response)
      await handler(request, response)
      await handler(request, response)

      await handler(request, response)

      expect(commentRepository.comments.length).toBe(5)
      expect(response.status).toHaveBeenCalledWith(500)
    })

    it("returns 404 for unknown article", async () => {
      request.body = {
        articleId: "123",
        message: "message",
      }

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(404)
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('comments.notFound', 1)
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

  function mockValidSession(auth0Id: string) {
    // @ts-ignore
    // noinspection JSConstantReassignment
    auth0.getSession = () => ({user: {sub: auth0Id}} as any)
  }

  function mockNoSession() {
    // @ts-ignore
    // noinspection JSConstantReassignment
    auth0.getSession = () => undefined as any
  }

})
