import {inject, injectable} from "tsyringe";
import type MetricPublisher from "../../domain/service/MetricPublisher";
import type UserRepository from "../../domain/entity/user/UserRepository";
import UserFactory from "../../domain/entity/user/UserFactory";
import User from "../../domain/entity/user/User";
import type NewsletterClient from "../../domain/service/NewsletterClient";
import GetUserApplicationService from "./GetUserApplicationService";

@injectable()
export default class UserApplicationService implements GetUserApplicationService {

  constructor(
      @inject("UserRepository") private readonly userRepository: UserRepository,
      @inject(UserFactory) private readonly userFactory: UserFactory,
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher,
      @inject("NewsletterClient") private readonly newsletterClient: NewsletterClient,
  ) {
  }

  async getOrCreateUser(email: string, auth0Id: string): Promise<{ created: boolean, user: User }> {
    const existingUser = await this.userRepository.findByAuth0Id(auth0Id)

    if (existingUser) {
      await this.metricPublisher.incrementCounter('user.login', 1)
      return {created: false, user: existingUser}
    }

    const newUser = this.userFactory.create({email, auth0Id});
    await this.metricPublisher.incrementCounter('user.created', 1)

    const newStoredUser = await this.userRepository.upsert(newUser)

    return {created: true, user: newStoredUser}
  }

  async updateUserData(auth0Id: string, changeData: { displayName?: string, allowNewsletter?: boolean, favoriteCategories?: string[] }): Promise<User> {
    const user = await this.userRepository.findByAuth0Id(auth0Id)

    if (!user) {
      throw new Error(`User with auth0Id '${auth0Id}' does not exist.`)
    }

    if (changeData.displayName !== undefined) {
      user.setDisplayName(changeData.displayName)
    }

    if (changeData.allowNewsletter !== undefined) {
      const beforeChangeAllowNewsletter = user.profile.allowNewsletter
      user.setAllowNewsletter(changeData.allowNewsletter)

      try {
        await this.updateNewsletterRegistration(beforeChangeAllowNewsletter, user);
      } catch (e) {
        console.error(e)
      }
    }

    if (changeData.favoriteCategories !== undefined) {
      user.setFavoriteCategories(changeData.favoriteCategories)
    }

    return await this.userRepository.upsert(user)
  }

  private async updateNewsletterRegistration(newsletterBeforeChange: boolean, user: User) {
    if (newsletterBeforeChange !== user.profile.allowNewsletter) {
      if (user.profile.allowNewsletter) {
        await this.newsletterClient.createContact(user.email)
      } else {
        await this.newsletterClient.deleteEmailFromNewsletter(user.email)
      }
    }
  }

  async getUserByAuth0Id(auth0Id: string): Promise<User | undefined> {
    return await this.userRepository.findByAuth0Id(auth0Id)
  }
}
