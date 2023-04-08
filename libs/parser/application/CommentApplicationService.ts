import {inject, injectable} from "tsyringe";
import Article from "../domain/entity/article/Article";
import type ArticleRepository from "../domain/entity/article/ArticleRepository";
import CommentFactory from "../domain/entity/comment/CommentFactory";
import type CommentRepository from "../domain/entity/comment/CommentRepository";
import AlgoliaManageDataClient from "../infrastructure/algolia/AlgoliaManageDataClient";
import type MetricPublisher from "../domain/service/MetricPublisher";
import type UserRepository from "../domain/entity/user/UserRepository";
import User from "../domain/entity/user/User";

export interface CommentWithUserInformationReply {
  id: string,
  createdAt: Date,
  message: string,
  visitorId: string,
  articleId: string,
  user: {
    id: string,
    displayName: string
  } | undefined
}

@injectable()
export default class CommentApplicationService {

  constructor(
      @inject("CommentRepository") private readonly commentRepository: CommentRepository,
      @inject(CommentFactory) private readonly commentFactory: CommentFactory,
      @inject("ArticleRepository") private readonly articleRepository: ArticleRepository,
      @inject("UserRepository") private readonly userRepository: UserRepository,
      @inject(AlgoliaManageDataClient) private readonly algoliaManageDataClient: AlgoliaManageDataClient,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher) {
  }

  async addComment(message: string, articleId: string, visitorId: string, auth0Id: string | undefined): Promise<Article | undefined> {
    const article = await this.articleRepository.findByArticleId(articleId)

    if (article) {
      const articleCount = await this.commentRepository.getCommentCountForArticleAndUser(article.id, visitorId)

      if (articleCount >= 5) {
        throw new Error("Not more than 5 articles allowed per user in a single article")
      }

      let user: User | undefined = undefined
      if (auth0Id) {
        user = await this.userRepository.findByAuth0Id(auth0Id)

        if (!user) {
          await this.metricPublisher.incrementCounter('comments.notExistingUser', 1)
        }
      }

      await this.commentRepository.addComment(this.commentFactory.create({
        message: message,
        visitorId: visitorId,
        articleId: article.id,
        userId: user?.id
      }))

      await this.algoliaManageDataClient.incrementArticleCommentCount(article.id)

      await this.metricPublisher.incrementCounter('comments.increment', 1)

      return article
    }

    await this.metricPublisher.incrementCounter('comments.notFound', 1)

    return undefined
  }

  async getCommentsFor(articleIds: string[]): Promise<CommentWithUserInformationReply[]> {
    let comments = await this.commentRepository.getCommentsFor(articleIds);
    let userIds: string[] = comments.map(c => c.userId).filter(userId => !!userId) as string[];
    let userForComments = await this.userRepository.findUsers(userIds)
    let sortedComments = comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sortedComments.map(c => ({
      id: c.id,
      createdAt: c.createdAt,
      message: c.message,
      visitorId: c.visitorId,
      articleId: c.articleId,
      user: c.userId && userForComments[c.userId] ? {
        id: userForComments[c.userId].id,
        displayName: userForComments[c.userId].displayName
      } : undefined
    }))
  }

  async getCommentCountFor(article: Article) {
    return await this.commentRepository.getCommentCountFor(article.id)
  }
}
