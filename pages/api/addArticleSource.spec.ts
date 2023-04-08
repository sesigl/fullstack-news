import handler from "./addArticleSource";
import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import ContainerProvider from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import DatadogMetricPublisher from "../../libs/parser/infrastructure/metrics/DatadogMetricPublisher";
import {setCookieFacadeOverride} from "./id";
import {setCookieFacadeOverride as setCookieFacadeOverrideInAuth} from "../../libs/api/auth";
import FakeCookieFacade from "../../tests/libs/fakes/FakeCookieFacade";
import FakeJwtTokenFacade from "../../tests/libs/fakes/FakeJwtTokenFacade";
import JwtTokenFacade from "../../libs/parser/infrastructure/jwt/JwtTokenFacade";
import * as auth0 from "@auth0/nextjs-auth0";
import FakeUserRepository from "../../tests/libs/fakes/FakeUserRepository";
import UserFactory from "../../libs/parser/domain/entity/user/UserFactory";
import User from "../../libs/parser/domain/entity/user/User";
import InMemoryArticleSourceRepository from "../../libs/parser/infrastructure/inmemory/InMemoryArticleSourceRepository";
import {CreateArticleSourceCommand} from "../../libs/interfaces/commands/CreateArticleSourceCommand";
import ArticleSourceCockroachRepository
  from "../../libs/parser/infrastructure/cockroach/ArticleSourceCockroachRepository";

jest.setTimeout(10000)

describe("addArticleSource", () => {

  let container = ContainerProvider.getContainerProvider()

  let createArticleSourceCommand: CreateArticleSourceCommand
  let USER: User

  let articleSourceRepository: InMemoryArticleSourceRepository;
  let datadogMetricPublisher: DatadogMetricPublisher
  let userRepository: FakeUserRepository;

  let request: NextApiRequest
  let response: NextApiResponse

  let fakeCookieFacade: FakeCookieFacade
  let jwtTokenFacade: FakeJwtTokenFacade

  let beforeConsoleError: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }

  beforeEach(() => {
    USER = new UserFactory().createFromExisting({
      id: "userId",
      auth0Id: "auth0Id", displayName: "displayName", email: "email",
    }, {allowNewsletter: true, favoriteCategories: []});

    createArticleSourceCommand = {
      id: null,
      rssFeedUrl: "https://www.new.org",
      parseConfiguration: {
        authorField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "author",
            extractRegExp: null
          }
        },
        categoriesField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "categories",
            extractRegExp: null
          }
        },
        descriptionField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "description",
            extractRegExp: null
          }
        },
        externalArticleLinkField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "externalArticleLink",
            extractRegExp: null
          }
        },
        imageLinkField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "imageLink",
            extractRegExp: null
          }
        },
        parsedAtField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "parsedAt",
            extractRegExp: null
          }
        },
        titleField: {
          configuration: {
            type: "DynamicFieldConfigurationCommand",
            objectPath: "title",
            extractRegExp: null
          }
        }
      },

    }

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

    userRepository.users = [USER]
    articleSourceRepository = new InMemoryArticleSourceRepository()
    container.register("ArticleSourceRepository", {useValue: articleSourceRepository})
    // @ts-ignore
    container.register(ArticleSourceCockroachRepository, {useValue: articleSourceRepository})

    beforeConsoleError = console.error
    console.error = jest.fn()
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

      mockNoSession()
    })

    it("returns 400 when messing fields", async () => {
      request.body = {
        rssFeedUrl: createArticleSourceCommand.rssFeedUrl,
      }

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(400)
      expect(response.send).toHaveBeenCalled()
    })

    it("returns 400 when no valid user", async () => {
      request.body = {
        rssFeedUrl: createArticleSourceCommand.rssFeedUrl,
      }
      mockNoSession()

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(400)
      expect(response.send).toHaveBeenCalled()
    })

    it("adds a new articleSource", async () => {
      mockValidSession(USER.auth0Id)
      request.body = {
        ...createArticleSourceCommand
      }

      const beforeCount = (await articleSourceRepository.findAll()).length

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(201)

      let articleSources = await articleSourceRepository.findAll();
      expect(articleSources.length).toBe(beforeCount + 1)
      expect(articleSources[articleSources.length - 1].rssUrl).toBe("https://www.new.org")
      expect(articleSources[articleSources.length - 1].creatorUserId).toBe(USER.id)
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('articleSources.increment', 1)
    })

    it("update other users articleSource is denied", async () => {
      mockValidSession(USER.auth0Id)
      request.body = {
        ...createArticleSourceCommand,
        id: 'newId',
      }

      const existingArticleSources = await articleSourceRepository.findAll();
      const beforeCount = existingArticleSources.length

      request.body = {
        ...createArticleSourceCommand,
        id: existingArticleSources[0].id,
        rssFeedUrl: "newUrl"
      }

      await handler(request, response)

      let articleSources = await articleSourceRepository.findAll();
      expect(articleSources.length).toBe(beforeCount)
    })

    it("update own articleSource is allowed", async () => {
      mockValidSession(USER.auth0Id)
      request.body = {
        ...createArticleSourceCommand,
        id: 'newId',
      }

      const existingArticleSources = await articleSourceRepository.findAll();
      const beforeCount = existingArticleSources.length

      existingArticleSources[0].creatorUserId = "userId"

      request.body = {
        ...createArticleSourceCommand,
        id: existingArticleSources[0].id,
        rssFeedUrl: "newUrl"
      }

      await handler(request, response)

      let articleSources = await articleSourceRepository.findAll();
      expect(articleSources.length).toBe(beforeCount)
      expect(articleSources.some(as => as.rssUrl === "newUrl")).toBe(true)
    })

    it("returns 500 for already existing rssFeed", async () => {
      request.body = {
        articleId: "123",
        message: "message",
      }

      mockValidSession(USER.auth0Id)
      request.body = {
        ...createArticleSourceCommand
      }

      await handler(request, response)
      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(500)
    })

  })

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
