import {inject, injectable} from "tsyringe";
import Article from "../domain/entity/article/Article";
import type ArticleRepository from "../domain/entity/article/ArticleRepository";
import VoteFactory from "../domain/entity/vote/VoteFactory";
import AlgoliaManageDataClient from "../infrastructure/algolia/AlgoliaManageDataClient";
import type VoteRepository from "../domain/entity/vote/VoteRepository";
import {ArticleVote} from "../domain/entity/vote/VoteRepository";
import type MetricPublisher from "../domain/service/MetricPublisher";

@injectable()
export default class VoteApplicationService {

  constructor(
      @inject("VoteRepository") private readonly voteRepository: VoteRepository,
      @inject(VoteFactory) private readonly voteFactory: VoteFactory,
      @inject("ArticleRepository") private readonly articleRepository: ArticleRepository,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher,
      @inject(AlgoliaManageDataClient) private readonly algoliaManageDataClient: AlgoliaManageDataClient) {
  }

  async addVote(articleId: string, visitorIdOrUserId: string): Promise<Article | undefined> {
    const article = await this.articleRepository.findByArticleId(articleId)

    if (article) {
      if ((await this.voteRepository.hasVote([article.id], visitorIdOrUserId))[0].hasVoted) {
        throw new Error(`${visitorIdOrUserId} visitor already voted for ${article.id}`)
      }
      await this.voteRepository.addVote(this.voteFactory.createUpVote(visitorIdOrUserId, article.id))

      // Slow
      //await this.algoliaManageDataClient.incrementArticleUpVoteCount(article.id)

      await this.metricPublisher.incrementCounter('votes.increment', 1)

      return article
    }

    await this.metricPublisher.incrementCounter('votes.notFound', 1)

    return undefined
  }

  async removeVote(articleId: string, visitorId: string): Promise<Article | undefined> {
    const article = await this.articleRepository.findByArticleId(articleId)

    if (article) {
      if (!(await this.voteRepository.hasVote([article.id], visitorId))[0].hasVoted) {
        throw new Error(`${visitorId} visitor has not voted for ${article.id}`)
      }

      await this.voteRepository.removeVote(article.id, visitorId)

      await this.metricPublisher.incrementCounter('votes.decrease', 1)

      return article
    }

    await this.metricPublisher.incrementCounter('votes.notFound', 1)

    return undefined
  }

  async hasVoted(articleIds: string[], visitorId: string): Promise<ArticleVote[]> {
    return await this.voteRepository.hasVote(articleIds, visitorId)
  }

  async getVoteCountFor(article: Article) {
    return await this.voteRepository.getVoteCountFor(article.id)
  }
}
