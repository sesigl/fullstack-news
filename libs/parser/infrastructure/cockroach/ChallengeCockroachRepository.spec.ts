import {beforeEach} from "@jest/globals";
import DatabaseCleaner from "../../../../tests/libs/cockroach/DatabaseCleaner";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import ChallengeCockroachRepository from "./ChallengeCockroachRepository";
import ChallengeFakeFactory from "../../../../tests/libs/factory/ChallengeFakeFactory";
import ArticleFakeFactory from "../../../../tests/libs/factory/ArticleFakeFactory";
import ArticleCockroachRepository from "./ArticleCockroachRepository";
import UserCockroachRepository from "./UserCockroachRepository";
import UserFakeFactory from "../../../../tests/libs/factory/UserFakeFactory";
import User from "../../domain/entity/user/User";

jest.setTimeout(30000)

describe("ChallengeCockroachRepository", () => {

  const container = ContainerProvider.getContainerProvider();

  const databaseCleaner = container.resolve(DatabaseCleaner)

  const challengeCockroachRepository = container.resolve(ChallengeCockroachRepository)
  const articleCockroachRepository = container.resolve(ArticleCockroachRepository)
  const userCockroachRepository = container.resolve(UserCockroachRepository)
  const challengeFakeFactory = new ChallengeFakeFactory()
  const articleFakeFactory = new ArticleFakeFactory()
  const userFakeFactory = new UserFakeFactory()

  let user: User
  beforeEach(async () => {
    await databaseCleaner.truncateAllTables()
    user = await userCockroachRepository.upsert(userFakeFactory.getOne())
  })

  afterEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  it("upsertChallenge - stores", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id)

    await challengeCockroachRepository.upsertChallenge(challenge)

    const allChallenges = await challengeCockroachRepository.findAll()

    expect(allChallenges.length).toBe(1)
    expect(JSON.stringify(allChallenges[0])).toBe(JSON.stringify(challenge))
  })

  it("upsertChallenge - updates", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id)

    await challengeCockroachRepository.upsertChallenge(challenge)
    const allChallenges = await challengeCockroachRepository.findAll()

    expect(allChallenges.length).toBe(1)
    expect(allChallenges[0].challengeName).toBe(challenge.challengeName)

    challenge.challengeName = "new name"
    let challengeChanged = challenge

    await challengeCockroachRepository.upsertChallenge(challengeChanged)
    const allChallengesAfterUpdate = await challengeCockroachRepository.findAll()

    expect(allChallengesAfterUpdate.length).toBe(1)
    expect(allChallengesAfterUpdate[0].challengeName).toBe(challengeChanged.challengeName)
  })

  it("findAllByUserId - returns null for no matches", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id)

    await challengeCockroachRepository.upsertChallenge(challenge)

    const allChallenges = await challengeCockroachRepository.findAllByUserId("0")

    expect(allChallenges).toHaveLength(0)
  })

  it("findAllByUserId - returns matches", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id)

    await challengeCockroachRepository.upsertChallenge(challenge)

    const allChallenges = await challengeCockroachRepository.findAllByUserId(challenge.creatorUserId!!)

    expect(allChallenges).toHaveLength(1)
  })

  it("findAllByArticleIds - returns empty list for no findings", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id)

    await challengeCockroachRepository.upsertChallenge(challenge)

    const allChallenges = await challengeCockroachRepository.findAllByArticleIds(["not-existing"])

    expect(allChallenges).toHaveLength(0)
  })

  it("findAllByArticleIds - returns matching list", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id, "challenge1")
    let article = articleFakeFactory.getOne()
    await articleCockroachRepository.insert(article)

    challenge.connectToArticle(article.id)

    let challenge2 = challengeFakeFactory.getOneFor(user.id, "challenge2")
    let article2 = articleFakeFactory.getOne()
    await articleCockroachRepository.insert(article2)

    challenge2.connectToArticle(article.id)
    challenge2.connectToArticle(article2.id)

    await challengeCockroachRepository.upsertChallenge(challenge)
    await challengeCockroachRepository.upsertChallenge(challenge2)

    const allChallenges = await challengeCockroachRepository.findAllByArticleIds([article.id])

    expect(allChallenges).toHaveLength(2)
    expect(allChallenges[0].challengeName).toBe(challenge2.challengeName)
    expect(allChallenges[1].challengeName).toBe(challenge.challengeName)

    const singleChallengeForOneArticle = await challengeCockroachRepository.findAllByArticleIds([article2.id])

    expect(singleChallengeForOneArticle).toHaveLength(1)
    expect(singleChallengeForOneArticle[0].challengeName).toBe(challenge2.challengeName)
  })

  it("existsWithRssFeedUrl - returns true for matches", async () => {
    let challenge = challengeFakeFactory.getOneFor(user.id)

    await challengeCockroachRepository.upsertChallenge(challenge)

    const storedChallenge = await challengeCockroachRepository.findById(challenge.id)

    expect(storedChallenge?.challengeName).toBe(challenge.challengeName)
  })

})
