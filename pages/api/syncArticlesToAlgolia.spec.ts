import handler, {API_KEY} from "./syncArticlesToAlgolia";
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
import FakeArticleRepository from "../../tests/libs/fakes/FakeArticleRepository";
import FakeAlgoliaManageDataClientFactory
  from "../../tests/libs/fakes/FakeAlgoliaManageDataClientFactory";
import AlgoliaManageDataClient
  from "../../libs/parser/infrastructure/algolia/AlgoliaManageDataClient";
import FakeCommentRepository from "../../tests/libs/fakes/FakeCommentRepository";
import FakeVoteRepository from "../../tests/libs/fakes/FakeVoteRepository";
import CommentFactory from "../../libs/parser/domain/entity/comment/CommentFactory";
import VoteFactory from "../../libs/parser/domain/entity/vote/VoteFactory";


describe("syncArticlesToAlgolia", () => {

  let container = ContainerProvider.getContainerProvider()
  let articleFactory = container.resolve(ArticleFactory)

  const ARTICLE_LINK = "link";

  const ARTICLE = articleFactory.createFromExisting({
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

  let articleRepository: ArticleRepository;
  let datadogMetricPublisher: DatadogMetricPublisher
  let algoliaManageDataClientMock: AlgoliaManageDataClient
  let commentRepository: FakeCommentRepository;
  let voteRepository: FakeVoteRepository;

  let request: NextApiRequest
  let response: NextApiResponse

  beforeEach(() => {
    request = {
      query: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    container.reset()
    container.register("ContentParser", {useValue: new StubContentParser()})
    articleRepository = new FakeArticleRepository();
    container.register("ArticleRepository", {useValue: articleRepository})

    algoliaManageDataClientMock = FakeAlgoliaManageDataClientFactory.createAlgoliaMock()
    container.register(AlgoliaManageDataClient, {useValue: algoliaManageDataClientMock})

    voteRepository = new FakeVoteRepository();
    container.register("VoteRepository", {useValue: voteRepository})

    commentRepository = new FakeCommentRepository();
    container.register("CommentRepository", {useValue: commentRepository})

    datadogMetricPublisher = new DatadogMetricPublisher();
    jest.spyOn(datadogMetricPublisher, 'incrementCounter')
    container.register("MetricPublisher", {useValue: datadogMetricPublisher})

  })

  it("returns 400 when no api key is given", async () => {
    await handler(request, response)

    expect(algoliaManageDataClientMock.upsertArticle).not.toHaveBeenCalled()
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalled()
  })

  it("does not insert new articles to algolia when no records exists", async () => {
    request.query.key = API_KEY

    await handler(request, response)

    expect(algoliaManageDataClientMock.upsertArticle).not.toHaveBeenCalled()
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith([])
  })

  it("does insert all articles to algolia", async () => {
    request.query.key = API_KEY

    await articleRepository.insert(ARTICLE)

    await commentRepository.addComment(new CommentFactory().create({
      userId: undefined,
      message: "message",
      visitorId: "visitorId",
      articleId: ARTICLE.id
    }))

    await voteRepository.addVote(new VoteFactory().createUpVote("visitorId", ARTICLE.id))
    await voteRepository.addVote(new VoteFactory().createUpVote("visitorId2", ARTICLE.id))

    await handler(request, response)

    expect(algoliaManageDataClientMock.upsertArticle).toHaveBeenCalledWith(ARTICLE, 1, 2)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith([ARTICLE])
  })

  it("does increases metrics", async () => {
    request.query.key = API_KEY

    await articleRepository.insert(ARTICLE)

    await commentRepository.addComment(new CommentFactory().create({
      userId: undefined,
      message: "message",
      visitorId: "visitorId",
      articleId: ARTICLE.id
    }))

    await voteRepository.addVote(new VoteFactory().createUpVote("visitorId", ARTICLE.id))
    await voteRepository.addVote(new VoteFactory().createUpVote("visitorId2", ARTICLE.id))

    await handler(request, response)

    expect(datadogMetricPublisher.incrementCounter).toHaveBeenNthCalledWith(1, 'algolia.upsert', 1)
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
