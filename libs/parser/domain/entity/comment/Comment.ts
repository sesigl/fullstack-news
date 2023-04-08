export default class Comment {

  constructor(
      readonly id: string,
      readonly createdAt: Date,
      readonly message: string,
      readonly visitorId: string,
      readonly articleId: string,
      readonly userId: string | undefined,
  ) {
  }
}
