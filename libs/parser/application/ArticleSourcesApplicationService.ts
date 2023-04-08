import {inject, injectable} from "tsyringe";
import type ArticleSourceRepository from "../domain/articleSource/ArticleSourceRepository";
import type MetricPublisher from "../domain/service/MetricPublisher";
import ArticleSource from "../domain/articleSource/entity/ArticleSource";
import {CreateArticleSourceCommand} from "../../interfaces/commands/CreateArticleSourceCommand";
import ArticleSourceFactory from "../domain/articleSource/ArticleSourceFactory";
import type UserRepository from "../domain/entity/user/UserRepository";
import User from "../domain/entity/user/User";
import {adminUsers} from "../../configuration";

@injectable()
export default class ArticleSourcesApplicationService {

  constructor(
      @inject("ArticleSourceRepository") private readonly articleSourceRepository: ArticleSourceRepository,
      @inject(ArticleSourceFactory) private readonly articleSourceFactory: ArticleSourceFactory,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher,
      @inject("UserRepository") private readonly userRepository: UserRepository) {
  }

  async getAllFor(userId: string): Promise<ArticleSource[]> {

    const user = await this.userRepository.findById(userId)

    if (adminUsers.includes(user?.email)) {
      return await this.articleSourceRepository.findAll();
    }

    return await this.articleSourceRepository.findAllByUserId(userId)
  }

  async get(articleSourceId: string): Promise<ArticleSource | undefined> {
    return await this.articleSourceRepository.findById(articleSourceId)
  }

  async add(createArticleSourceCommand: CreateArticleSourceCommand, auth0Id: string): Promise<ArticleSource> {

    if (!createArticleSourceCommand.rssFeedUrl
        || !createArticleSourceCommand.parseConfiguration) {
      throw new Error("All values required")
    }

    let user: User | undefined
    user = await this.userRepository.findByAuth0Id(auth0Id)

    if (!user) {
      throw new Error(`Can not create article source, user with auth0Id ${auth0Id} does not exists.`)
    }

    let articleSource = this.articleSourceFactory.create(createArticleSourceCommand, user.id, false);

    if (createArticleSourceCommand.id) {
      const existingArticleSource = await this.articleSourceRepository.findById(createArticleSourceCommand.id)

      if (!existingArticleSource) {
        throw new Error("Given id does not exist")
      }

      if (existingArticleSource.creatorUserId !== user.id) {
        throw new Error("Access denied")
      }
    }

    const articleSourceWithSameUrl = await this.articleSourceRepository.findByRssFeedUrl(createArticleSourceCommand.rssFeedUrl);
    if (articleSourceWithSameUrl && articleSourceWithSameUrl.id !== createArticleSourceCommand.id) {
      throw new Error("Article Source with same URL already exists")
    }

    // all new or changed entities are not public and require a review
    articleSource.approved = false

    const createdArticleSource = await this.articleSourceRepository.upsertArticleSource(articleSource)

    await this.metricPublisher.incrementCounter('articleSources.increment', 1)

    return Promise.resolve(createdArticleSource);
  }
}
