import Vote from "../vote/Vote";
import {CommentWithUserInformationReply} from "../../../application/CommentApplicationService";
import Challenge from "../../challenge/Challenge";

export default class ArticleWithRelations {

  constructor(
      readonly id: string,
      readonly createdAt: Date,
      readonly updatedAt: Date,
      readonly title: string,
      readonly description: string,
      readonly author: string,
      readonly link: string,
      readonly imageLink: string,
      readonly parsedAt: Date,
      readonly tags: string[],
      // relations
      readonly comments: CommentWithUserInformationReply[],
      readonly votes: Vote[],
      readonly articleSourceId: string,
      public challenges: Challenge[]
  ) {
  }

  hasVoted(visitorId: string | undefined) {
    return this.votes.find(v => v.visitorId === visitorId) !== undefined
  }
}
