import handler from "./getComments";
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
import CommentFactory from "../../libs/parser/domain/entity/comment/CommentFactory";
import Comment from "../../libs/parser/domain/entity/comment/Comment";
import {CommentView} from "../../libs/getPosts";
import FakeUserRepository from "../../tests/libs/fakes/FakeUserRepository";
import UserFactory from "../../libs/parser/domain/entity/user/UserFactory";
import User from "../../libs/parser/domain/entity/user/User";

function createArticle(articleFactory: ArticleFactory, articleLink: string) {
  return articleFactory.createFromExisting({
    author: "author",
    createdAt: new Date(),
    description: "description",
    id: articleLink,
    imageLink: "imageLink",
    link: articleLink,
    parsedAt: new Date(),
    tags: [],
    mlTags: [],
    title: "title",
    updatedAt: new Date(),
    articleSourceId: "articleSourceId"
  });
}

describe("getComments", () => {

  let container = ContainerProvider.getContainerProvider()
  let articleFactory = container.resolve(ArticleFactory)

  const ARTICLE_LINK = "link";
  const ARTICLE_LINK2 = "link2";

  let ARTICLE: Article
  let ARTICLE2: Article

  let articleRepository: FakeArticleRepository;
  let userRepository: FakeUserRepository;
  let commentRepository: FakeCommentRepository;
  let datadogMetricPublisher: DatadogMetricPublisher

  let request: NextApiRequest
  let response: NextApiResponse

  let fakeCookieFacade: FakeCookieFacade
  let jwtTokenFacade: FakeJwtTokenFacade

  let beforeConsoleError: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }

  let COMMENT: Comment;
  let COMMENT2: Comment;
  let USER: User;

  beforeEach(() => {
    ARTICLE = createArticle(articleFactory, ARTICLE_LINK);
    ARTICLE2 = createArticle(articleFactory, ARTICLE_LINK2);

    USER = new UserFactory().createFromExisting({
      id: "userId",
      auth0Id: "auth0Id", displayName: "displayName", email: "email",
    }, {allowNewsletter: true, favoriteCategories: []});

    COMMENT = new CommentFactory().createFromExisting({
      id: "commentId",
      createdAt: new Date(),
      articleId: ARTICLE.id,
      message: "message",
      visitorId: "test-visitor-id",
      userId: undefined
    });

    COMMENT2 = new CommentFactory().createFromExisting({
      id: "commentId2",
      createdAt: new Date(),
      articleId: ARTICLE2.id,
      message: "message2",
      visitorId: "test-visitor-id",
      userId: "userId"
    });

    request = {
      query: {},
      body: {}
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

    commentRepository = new FakeCommentRepository();
    container.register("CommentRepository", {useValue: commentRepository})

    userRepository = new FakeUserRepository();
    container.register("UserRepository", {useValue: userRepository})

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
    userRepository.users = [
      USER
    ]
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
      articleRepository.insert(ARTICLE2)

      commentRepository.addComment(COMMENT)
      commentRepository.addComment(COMMENT2)
    })

    it("returns 400 when no article id", async () => {
      request.body = {}

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(400)
      expect(response.send).toHaveBeenCalled()
    })

    it("returns comments", async () => {
      request.body = {
        articleId: [ARTICLE.id, ARTICLE2.id],
      }

      await handler(request, response)

      expect(response.json).toHaveBeenCalledWith([{
        articleId: ARTICLE.id,
        id: COMMENT.id,
        message: COMMENT.message,
        createdAt: COMMENT.createdAt.toISOString(),
        user: null
      } as CommentView,
        {
          articleId: ARTICLE2.id,
          id: COMMENT2.id,
          message: COMMENT2.message,
          createdAt: COMMENT2.createdAt.toISOString(),
          user: {id: USER.id, displayName: USER.displayName}
        } as CommentView])
    })

    it("returns empty list for unknown article", async () => {
      request.body = {
        articleId: ["123"]
      }

      await handler(request, response)

      expect(response.json).toHaveBeenCalledWith([])
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
