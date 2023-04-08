import {beforeEach} from "@jest/globals";
import DatabaseCleaner from "../../../../tests/libs/cockroach/DatabaseCleaner";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import ArticleSourceCockroachRepository from "./ArticleSourceCockroachRepository";
import ArticleSourceFakeFactory from "../../../../tests/libs/factory/ArticleSourceFakeFactory";

jest.setTimeout(30000)

describe("ArticleSourceCockroachRepository", () => {

  const container = ContainerProvider.getContainerProvider();

  const databaseCleaner = container.resolve(DatabaseCleaner)

  const articleSourceCockroachRepository = container.resolve<ArticleSourceCockroachRepository>(ArticleSourceCockroachRepository)
  const articleSourceFakeFactory = new ArticleSourceFakeFactory()

  beforeEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  afterEach(async () => {
    await databaseCleaner.truncateAllTables()
  })

  it("upsertArticleSource - stores", async () => {
    let articleSource = articleSourceFakeFactory.getOne()

    await articleSourceCockroachRepository.upsertArticleSource(articleSource)

    const allArticleSources = await articleSourceCockroachRepository.findAll()

    expect(allArticleSources.length).toBe(1)
    expect(JSON.stringify(allArticleSources[0])).toBe(JSON.stringify(articleSource))
  })

  it("upsertArticleSource - updates", async () => {
    let articleSource = articleSourceFakeFactory.getOne()

    await articleSourceCockroachRepository.upsertArticleSource(articleSource)
    const allArticleSources = await articleSourceCockroachRepository.findAll()

    expect(allArticleSources.length).toBe(1)
    expect(allArticleSources[0].rssUrl).toBe(articleSource.rssUrl)

    let articleSourceChanged = articleSourceFakeFactory.getOne("newRssUrl")

    await articleSourceCockroachRepository.upsertArticleSource(articleSourceChanged)
    const allArticleSourcesAfterUpdate = await articleSourceCockroachRepository.findAll()

    expect(allArticleSourcesAfterUpdate.length).toBe(1)
    expect(allArticleSourcesAfterUpdate[0].rssUrl).toBe(articleSourceChanged.rssUrl)
  })

  it("findAllByUserId - returns null for no matches", async () => {
    let articleSource = articleSourceFakeFactory.getOne()

    await articleSourceCockroachRepository.upsertArticleSource(articleSource)

    const allArticleSources = await articleSourceCockroachRepository.findAllByUserId("0")

    expect(allArticleSources).toHaveLength(0)
  })

  it("findAllByUserId - returns matches", async () => {
    let articleSource = articleSourceFakeFactory.getOne()

    await articleSourceCockroachRepository.upsertArticleSource(articleSource)

    const allArticleSources = await articleSourceCockroachRepository.findAllByUserId(articleSource.creatorUserId)

    expect(allArticleSources).toHaveLength(1)
  })

  it("existsWithRssFeedUrl - returns false for no matches", async () => {
    let articleSource = articleSourceFakeFactory.getOne()

    await articleSourceCockroachRepository.upsertArticleSource(articleSource)

    const exists = await articleSourceCockroachRepository.existsWithRssFeedUrl("does not exist")

    expect(exists).toBe(false)
  })

  it("existsWithRssFeedUrl - returns true for matches", async () => {
    let articleSource = articleSourceFakeFactory.getOne()

    await articleSourceCockroachRepository.upsertArticleSource(articleSource)

    const exists = await articleSourceCockroachRepository.existsWithRssFeedUrl(articleSource.rssUrl)

    expect(exists).toBe(true)
  })

})
