export default class Vote {

  static createUpVote(visitorId: string, articleId: string) {
    return new Vote(new Date(), 1, visitorId, articleId)
  }

  constructor(
      readonly createdAt: Date,
      readonly value: number,
      readonly visitorId: string,
      readonly articleId: string,
  ) {
  }
}
