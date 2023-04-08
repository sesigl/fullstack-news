import Vote from "./Vote";
import {injectable} from "tsyringe";

@injectable()
export default class VoteFactory {

  createUpVote(visitorId: string, articleId: string) {
    return new Vote(new Date(), 1, visitorId, articleId)
  }

  createDownVote(visitorId: string, articleId: string) {
    return new Vote(new Date(), -1, visitorId, articleId)
  }
}