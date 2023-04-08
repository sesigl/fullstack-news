import {beforeEach} from "@jest/globals";
import DatabaseCleaner from "../../../../tests/libs/cockroach/DatabaseCleaner";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import CommentCockroachRepository from "./CommentCockroachRepository";
import CommentFactory from "../../domain/entity/comment/CommentFactory";
import ArticleCockroachRepository from "./ArticleCockroachRepository";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import UserCockroachRepository from "./UserCockroachRepository";
import UserFactory from "../../domain/entity/user/UserFactory";
import User from "../../domain/entity/user/User";

jest.setTimeout(30000)

describe("CommentCockroachRepository", () => {

  const container = ContainerProvider.getContainerProvider();

  const databaseCleaner = container.resolve(DatabaseCleaner)

  const commentCockroachRepository = container.resolve<CommentCockroachRepository>(CommentCockroachRepository)
  const userCockroachRepository = container.resolve<UserCockroachRepository>(UserCockroachRepository)
  const articleCockroachRepository = container.resolve<ArticleCockroachRepository>(ArticleCockroachRepository)
  const commentFactory = container.resolve<CommentFactory>(CommentFactory)

  const VISITOR_ID = "visitorId";
  const USER_ID = "userId";
  const ARTICLE_ID = "articleId";

  const USER: User = new UserFactory().createFromExisting({
    id: USER_ID,
    auth0Id: "auth0Id", displayName: "displayName", email: "email",
  }, {allowNewsletter: true, favoriteCategories: []});

  const TEST_ARTICLE = new ArticleFactory().createFromExisting({
    id: ARTICLE_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "title",
    author: "author",
    description: "description",
    link: "http://localhost/article",
    tags: ["tag1"],
    mlTags: [],
    parsedAt: new Date(),
    imageLink: "http://localhost/image",
    articleSourceId: "articleSourceId"
  });

  beforeEach(async () => {
    await databaseCleaner.truncateAllTables()
    await articleCockroachRepository.insert(TEST_ARTICLE)
    await userCockroachRepository.upsert(USER)
  })

  afterEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  it("getCommentCount - returns comment count", async () => {
    let comment = commentFactory.create({
      message: "my message",
      articleId: ARTICLE_ID,
      visitorId: VISITOR_ID,
      userId: undefined
    });

    const commentFromDb = await commentCockroachRepository.addComment(comment)
    expect(commentFromDb).toEqual(comment)

    let comment2 = commentFactory.create({
      message: "my message 2",
      articleId: ARTICLE_ID,
      visitorId: VISITOR_ID,
      userId: undefined
    });

    await commentCockroachRepository.addComment(comment2)

    let commentCountFromDb = await commentCockroachRepository.getCommentCountFor(ARTICLE_ID);

    expect(commentCountFromDb).toBe(2)
  })

  describe('getCommentsFor', () => {
    it("stores comments for visitors", async () => {
      let comment = commentFactory.create({
        message: "my message",
        articleId: ARTICLE_ID,
        visitorId: VISITOR_ID,
        userId: undefined
      });

      const commentFromDb = await commentCockroachRepository.addComment(comment)
      expect(commentFromDb).toEqual(comment)

      let comments = await commentCockroachRepository.getCommentsFor([ARTICLE_ID]);

      expect(comments.length).toBe(1)
      expect(comments[0].userId).toBe(undefined)
    })

    it("stores comments for users", async () => {
      let comment = commentFactory.create({
        message: "my message",
        articleId: ARTICLE_ID,
        visitorId: VISITOR_ID,
        userId: USER.id
      });

      const commentFromDb = await commentCockroachRepository.addComment(comment)
      expect(commentFromDb).toEqual(comment)

      let comments = await commentCockroachRepository.getCommentsFor([ARTICLE_ID]);

      expect(comments.length).toBe(1)
      expect(comments[0].userId).toBe(USER.id)
    })
  })


  it("addComment - fails for non existing articles", async () => {
    let comment = commentFactory.create({
      message: "my message",
      articleId: "doesNotExist",
      visitorId: VISITOR_ID,
      userId: undefined
    });

    await expect(async () => commentCockroachRepository.addComment(comment)).rejects.toBeTruthy()
  })

})
