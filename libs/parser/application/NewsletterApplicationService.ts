import {inject, injectable} from "tsyringe";
import type MetricPublisher from "../domain/service/MetricPublisher";
import type NewsletterClient from "../domain/service/NewsletterClient";


@injectable()
export default class NewsletterApplicationService {

  constructor(
      @inject("MetricPublisher") private readonly metricPublisher: MetricPublisher,
      @inject("NewsletterClient") private readonly newsletterClient: NewsletterClient,
  ) {
  }

  async addToNewsletter(email: string) {
    try {
      await this.newsletterClient.createContact(email);
      await this.metricPublisher.incrementCounter("subscriber.increment", 1)
    } catch (e) {
      await this.metricPublisher.incrementCounter("subscriber.error", 1)
      console.error("Newsletter publish failed for email " + email);
      throw e
    }
  }
}
