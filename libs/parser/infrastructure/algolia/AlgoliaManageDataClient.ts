import algoliasearch from "algoliasearch";
import Article from "../../domain/entity/article/Article";
import {DeleteResponse} from "@algolia/client-search";
import {injectable} from "tsyringe";

const client = algoliasearch('TSNCBUHTX5', process.env.ALGOLIA_ADMIN_API_KEY as string);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX as string);

export interface AlgoliaArticle extends Pick<Article, "title" | "link" | "author" | "tags" | "description"> {
  objectID: string,
  parsedAt: string,
  voteCount: number,
  commentCount: number
}

@injectable()
export default class AlgoliaManageDataClient {

  async upsertArticle(article: Article, commentCount = 0, voteCount = 0): Promise<void> {

    let algoliaArticle: AlgoliaArticle = {
      objectID: article.id,
      title: article.title,
      description: article.description,
      author: article.author,
      tags: article.tags,
      link: article.link,
      parsedAt: article.parsedAt.toISOString(),
      commentCount: commentCount,
      voteCount: voteCount
    };

    await index.saveObject(algoliaArticle).wait()

    return
  }

  clearAll(): Promise<DeleteResponse> {
    return index.clearObjects()
  }

  async incrementArticleUpVoteCount(articleId: string): Promise<void> {
    await index.partialUpdateObject({
      voteCount: {
        _operation: 'Increment',
        value: 1,
      },
      objectID: articleId,
    }).wait()

    return
  }

  async incrementArticleCommentCount(articleId: string): Promise<void> {
    await index.partialUpdateObject({
      commentCount: {
        _operation: 'Increment',
        value: 1,
      },
      objectID: articleId,
    }).wait()

    return
  }
}