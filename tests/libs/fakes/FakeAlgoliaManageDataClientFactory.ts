import AlgoliaManageDataClient
  from "../../../libs/parser/infrastructure/algolia/AlgoliaManageDataClient";

export default class FakeAlgoliaManageDataClientFactory {
  static createAlgoliaMock(): AlgoliaManageDataClient {
    return {
      clearAll: jest.fn(),
      incrementArticleCommentCount: jest.fn(),
      incrementArticleUpVoteCount: jest.fn(),
      upsertArticle: jest.fn()
    }
  }
}