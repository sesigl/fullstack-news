import {handler} from "./getPersonalizedPosts";
import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import ArticleRepository from "../../libs/parser/domain/entity/article/ArticleRepository";
import FakeArticleRepository from "../../tests/libs/fakes/FakeArticleRepository";
import GetArticlesApplicationServices
  from "../../libs/parser/application/GetArticlesApplicationServices";
import FakeContentParser from "../../tests/libs/fakes/FakeContentParser";
import FakeMetricPublisher from "../../tests/libs/fakes/FakeMetricPublisher";
import FakeGetUserApplicationService from "../../tests/libs/fakes/FakeGetUserApplicationService";
import RequestResponseFakeFactory from "../../tests/libs/factory/RequestResponseFakeFactory";
import AuthTestConfigurator from "../../tests/libs/test-case-configurator/AuthTestConfigurator";
import ArticleFakeFactory from "../../tests/libs/factory/ArticleFakeFactory";
import UserFakeFactory from "../../tests/libs/factory/UserFakeFactory";
import {mocked} from "jest-mock";
import Article from "../../libs/parser/domain/entity/article/Article";

describe("getPersonalizedPosts", () => {

  let container = ContainerProvider.getContainerProvider()
  let parser: FakeContentParser;

  let metricPublisher: FakeMetricPublisher
  let articleRepository: FakeArticleRepository
  let userApplicationService: FakeGetUserApplicationService;
  let authTestConfigurator: AuthTestConfigurator;

  let request: NextApiRequest
  let response: NextApiResponse

  beforeEach(() => {

    const reqResp = new RequestResponseFakeFactory().get()
    request = reqResp.request
    response = reqResp.response

    container.reset()
    container.register("GetArticlesApplicationServices", {useToken: GetArticlesApplicationServices})

    parser = new FakeContentParser();
    container.register("ContentParser", {useValue: parser})

    articleRepository = new FakeArticleRepository();
    container.register("ArticleRepository", {useValue: articleRepository})

    userApplicationService = new FakeGetUserApplicationService();
    container.register("GetUserApplicationService", {useValue: userApplicationService})

    metricPublisher = new FakeMetricPublisher();
    container.register("MetricPublisher", {useValue: metricPublisher})

    authTestConfigurator = new AuthTestConfigurator(container);
    authTestConfigurator.mockNoSession()
  })

  it("returns matching articles", async () => {
    const article = new ArticleFakeFactory().getWithCategory("cat1")
    const articleWithoutCategory = new ArticleFakeFactory().getOne()
    articleRepository.articles.push(article)
    articleRepository.articles.push(articleWithoutCategory)

    const user = new UserFakeFactory().getWithCategory("cat1")
    authTestConfigurator.mockValidSession(user)
    userApplicationService.user = user

    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expectJsonResponseWithArticle(response, article);
  })

  it("returns empty list if not authenticated", async () => {
    const article = new ArticleFakeFactory().getWithCategory("cat1")
    articleRepository.articles.push(article)
    authTestConfigurator.mockNoSession()

    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toBeCalledWith([])
  })

})

function expectJsonResponseWithArticle(response: NextApiResponse, article: Article) {
  expect(mocked(response.json).mock.calls[0][0][0].id).toBe(article.id)
  expect(mocked(response.json).mock.calls[0][0]).toHaveLength(1)
}
