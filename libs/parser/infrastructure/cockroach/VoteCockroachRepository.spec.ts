import {beforeEach} from "@jest/globals";
import DatabaseCleaner from "../../../../tests/libs/cockroach/DatabaseCleaner";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import VoteCockroachRepository from "./VoteCockroachRepository";
import VoteFactory from "../../domain/entity/vote/VoteFactory";
import ArticleCockroachRepository from "./ArticleCockroachRepository";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";

jest.setTimeout(30000)

describe("VoteCockroachRepository", () => {

  const container = ContainerProvider.getContainerProvider();

  const databaseCleaner = container.resolve(DatabaseCleaner)

  const voteCockroachRepository = container.resolve<VoteCockroachRepository>(VoteCockroachRepository)
  const articleCockroachRepository = container.resolve<ArticleCockroachRepository>(ArticleCockroachRepository)
  const voteFactory = container.resolve<VoteFactory>(VoteFactory)

  const USER_ID = "userId";
  const ARTICLE_ID = "articleId";

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
  })

  afterEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  it("getVoteCount - returns vote count", async () => {
    let vote = voteFactory.createUpVote(USER_ID, ARTICLE_ID);
    const voteFromDb = await voteCockroachRepository.addVote(vote)

    let voteCountFromDb = await voteCockroachRepository.getVoteCountFor(ARTICLE_ID);

    expect(voteFromDb).toEqual(vote)
    expect(voteCountFromDb).toBe(1)
  })

  it("hasVote - returns true if exists", async () => {
    await voteCockroachRepository.addVote(voteFactory.createUpVote(USER_ID, ARTICLE_ID))

    let hasVoteFromDb = await voteCockroachRepository.hasVote([ARTICLE_ID], USER_ID);

    expect(hasVoteFromDb).toBeTruthy()
  })

})
