import algoliasearch from "algoliasearch";
import Article from "../../domain/entity/article/Article";
import {SearchResponse} from "@algolia/client-search";

const client = algoliasearch('TSNCBUHTX5', process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY as string);
const index = client.initIndex(process.env.NEXT_PUBLIC_ALGOLIA_INDEX as string);

export interface AlgoliaArticle extends Pick<Article, "title" | "link" | "author" | "tags" | "description"> {
  objectID: string,
  parsedAt: string,
  voteCount: number,
  commentCount: number
}

export default class AlgoliaSearchDataClient {

  async search(query: string): Promise<SearchResponse<AlgoliaArticle>> {
    return index.search<AlgoliaArticle>(query);
  }
}