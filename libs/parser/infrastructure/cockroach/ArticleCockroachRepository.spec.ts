import ArticleCockroachRepository from "./ArticleCockroachRepository";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {beforeEach} from "@jest/globals";
import DatabaseCleaner from "../../../../tests/libs/cockroach/DatabaseCleaner";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import CommentCockroachRepository from "./CommentCockroachRepository";
import VoteCockroachRepository from "./VoteCockroachRepository";
import CommentFactory from "../../domain/entity/comment/CommentFactory";
import VoteFactory from "../../domain/entity/vote/VoteFactory";
import UserFactory from "../../domain/entity/user/UserFactory";
import UserCockroachRepository from "./UserCockroachRepository";

jest.setTimeout(30000)

describe("ArticleCockroachRepository", () => {

  const container = ContainerProvider.getContainerProvider();

  const databaseCleaner = container.resolve(DatabaseCleaner)
  const articleFactory = new ArticleFactory()

  const articleCockroachRepository = container.resolve(ArticleCockroachRepository)
  const commentCockroachRepository = container.resolve(CommentCockroachRepository)
  const voteCockroachRepository = container.resolve(VoteCockroachRepository)
  const userCockroachRepository = container.resolve(UserCockroachRepository)

  const ARTICLE = articleFactory.create({
    title: "title",
    author: "author",
    description: "description",
    link: "http://localhost/article",
    tags: ["tag1"],
    mlTags: [],
    parsedAt: new Date(),
    imageLink: "http://localhost/image",
    articleSourceId: 'articleSourceId'
  });

  const USER = new UserFactory().createFromExisting({
    id: "userId",
    auth0Id: "auth0Id", displayName: "displayName", email: "email",
  }, {allowNewsletter: true, favoriteCategories: []});

  beforeEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  afterEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  it("stores articles", async () => {

    await articleCockroachRepository.insert(ARTICLE)

    const {
      createdAt: createdAtFromDatabase,
      updatedAt: updatedAtFromDatabase,
      ...articleFromDatabaseWithoutDates
    } = (await articleCockroachRepository.findByLink(ARTICLE.link))[0]

    const {
      createdAt,
      updatedAt,
      ...articleWithoutDates
    } = ARTICLE

    expect(articleFromDatabaseWithoutDates).toEqual(articleWithoutDates)
  })

  it("gets articles with votes and comments", async () => {
    await userCockroachRepository.upsert(USER)
    await articleCockroachRepository.insert(ARTICLE)
    await commentCockroachRepository.addComment(new CommentFactory().create({
      message: "message",
      visitorId: "visitorId",
      articleId: ARTICLE.id,
      userId: USER.id
    }))

    await commentCockroachRepository.addComment(new CommentFactory().create({
      message: "message",
      visitorId: "visitorId2",
      articleId: ARTICLE.id,
      userId: undefined
    }))

    await voteCockroachRepository.addVote(new VoteFactory().createUpVote("visitorId", ARTICLE.id))

    const {
      createdAt: createdAtFromDatabase,
      updatedAt: updatedAtFromDatabase,
      comments: commentsFromDatabase,
      votes: votesFromDatabase,
      challenges: challengesFromDatabase,
      ...articleFromDatabaseWithoutDates
    } = (await articleCockroachRepository.findAllWithRelations())[0]

    const {
      createdAt,
      updatedAt,
      ...articleWithoutDates
    } = ARTICLE

    expect(articleFromDatabaseWithoutDates).toEqual({...articleWithoutDates})

    expect(votesFromDatabase.length).toEqual(1)
    expect(votesFromDatabase[0].articleId).toEqual(ARTICLE.id)
    expect(votesFromDatabase[0].visitorId).toEqual("visitorId")

    expect(commentsFromDatabase.length).toEqual(2)
    expect(commentsFromDatabase[1].articleId).toEqual(ARTICLE.id)
    expect(commentsFromDatabase[1].visitorId).toEqual("visitorId")
    expect(commentsFromDatabase[1].message).toEqual("message")
    expect(commentsFromDatabase[1].user?.id).toEqual(USER.id)
    expect(commentsFromDatabase[1].user?.displayName).toEqual(USER.displayName)

    expect(commentsFromDatabase[0].user).toEqual(undefined)
    expect(commentsFromDatabase[0].visitorId).toEqual("visitorId2")
  })

  it("creates creation date", async () => {
    const beforeSaveDate = new Date()

    await articleCockroachRepository.insert(ARTICLE)

    const afterSaveDate = new Date()

    const articleFromDatabase = (await articleCockroachRepository.findByLink(ARTICLE.link))[0]

    expect(articleFromDatabase.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSaveDate.getTime())
    expect(articleFromDatabase.createdAt.getTime()).toBeLessThanOrEqual(afterSaveDate.getTime())
  })

  it("creates updateAt date", async () => {
    const beforeSaveDate = new Date()

    await articleCockroachRepository.insert(ARTICLE)

    const afterSaveDate = new Date()

    const articleFromDatabase = (await articleCockroachRepository.findByLink(ARTICLE.link))[0]

    expect(articleFromDatabase.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeSaveDate.getTime())
    expect(articleFromDatabase.updatedAt.getTime()).toBeLessThanOrEqual(afterSaveDate.getTime())
  })

})
