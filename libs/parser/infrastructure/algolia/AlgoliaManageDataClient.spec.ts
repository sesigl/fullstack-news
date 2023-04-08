import AlgoliaManageDataClient from "./AlgoliaManageDataClient";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {beforeEach} from "@jest/globals";
import AlgoliaSearchDataClient from "./AlgoliaSearchDataClient";

jest.setTimeout(60000)

describe("AlgoliaManageDataClient", () => {

  let algoliaManageDataClient = new AlgoliaManageDataClient();
  let algoliaSearchDataClient = new AlgoliaSearchDataClient();


  beforeEach(async () => {
    await algoliaManageDataClient.clearAll()
  })

  function createArticleWithTitle(title: string) {
    return new ArticleFactory().create({
      title: title,
      description: "description of first article",
      author: "Creators of fullstack news",
      tags: ["example", "test"],
      mlTags: [],
      parsedAt: new Date(),
      link: "http://localhost/articles/first-article",
      imageLink: "http://localhost/images/first-article",
      articleSourceId: "articleSourceId"
    });
  }

  it("stores searchable articles", async () => {
    let article = createArticleWithTitle("first article");

    await algoliaManageDataClient.upsertArticle(article);

    const searchResults = await algoliaSearchDataClient.search('article')
    expect(searchResults.hits).toHaveLength(1)

    let hit = searchResults.hits[0];
    expect(hit.title).toEqual(article.title)
    expect(hit.description).toEqual(article.description)
  })

  it('should update existing articles and impact the order', async function () {
    let article = createArticleWithTitle("first article");
    await algoliaManageDataClient.upsertArticle(article);

    let article2 = createArticleWithTitle("second article");
    await algoliaManageDataClient.upsertArticle(article2);
    await algoliaManageDataClient.incrementArticleUpVoteCount(article2.id)

    const searchResultsAfterIncrement = await algoliaSearchDataClient.search('article')

    expect(searchResultsAfterIncrement.hits[0].title).toEqual("second article")
    expect(searchResultsAfterIncrement.hits[1].title).toEqual("first article")

    await algoliaManageDataClient.incrementArticleUpVoteCount(article.id)
    await algoliaManageDataClient.incrementArticleUpVoteCount(article.id)

    const searchResultsAfterIncrement2 = await algoliaSearchDataClient.search('article')

    expect(searchResultsAfterIncrement2.hits[0].title).toEqual("first article")
    expect(searchResultsAfterIncrement2.hits[1].title).toEqual("second article")
  });

})
