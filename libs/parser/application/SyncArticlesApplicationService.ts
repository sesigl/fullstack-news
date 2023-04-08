import type ArticleRepository from "../domain/entity/article/ArticleRepository";
import {inject, injectable} from "tsyringe";
import Article from "../domain/entity/article/Article";
import AlgoliaManageDataClient from "../infrastructure/algolia/AlgoliaManageDataClient";
import type VoteRepository from "../domain/entity/vote/VoteRepository";
import type CommentRepository from "../domain/entity/comment/CommentRepository";
import type MetricPublisher from "../domain/service/MetricPublisher";

@injectable()
export default class SyncArticlesApplicationService {

  constructor(
      @inject("ArticleRepository") private readonly articleRepository: ArticleRepository,
      @inject("VoteRepository") private readonly voteRepository: VoteRepository,
      @inject("CommentRepository") private readonly commentRepository: CommentRepository,
      @inject(AlgoliaManageDataClient) private readonly algoliaManageDataClient: AlgoliaManageDataClient,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher) {
  }

  async syncAlgolia(): Promise<Article[]> {
    let articles = await this.articleRepository.findAll();
    let insertPromises: Promise<void>[] = []
    for (const article of articles) {
      let commentCount = await this.commentRepository.getCommentCountFor(article.id);
      let voteCount = await this.voteRepository.getVoteCountFor(article.id);
      const promise = this.algoliaManageDataClient.upsertArticle(article, commentCount, voteCount)

      insertPromises.push(promise)
    }

    await Promise.all(insertPromises)

    await this.metricPublisher.incrementCounter('algolia.upsert', insertPromises.length)

    return articles
  }
}
