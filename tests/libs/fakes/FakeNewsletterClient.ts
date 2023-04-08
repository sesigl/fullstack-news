import NewsletterClient from "../../../libs/parser/domain/service/NewsletterClient";

export default class FakeNewsletterClient implements NewsletterClient {

  throwErrorOnCall = false
  contacts: string[] = []

  createContact(email: string): Promise<void> {

    if (this.throwErrorOnCall) {
      throw new Error('something went wrong')
    }

    this.contacts.push(email)

    return Promise.resolve(undefined);
  }

  deleteEmailFromNewsletter(email: string): Promise<void> {

    if (this.throwErrorOnCall) {
      throw new Error('something went wrong')
    }

    this.contacts = this.contacts.filter(c => c !== email)

    return Promise.resolve(undefined);
  }


}
