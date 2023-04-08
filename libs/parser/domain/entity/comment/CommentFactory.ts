import {singleton} from "tsyringe";
import Comment from "./Comment"
import {v4 as uuidv4} from "uuid";

@singleton()
export default class CommentFactory {

  create({
           message,
           visitorId,
           articleId,
           userId
         }: { message: string, visitorId: string, articleId: string, userId: string | undefined }) {
    return new Comment(
        uuidv4(), new Date(), message, visitorId, articleId, userId
    )
  }

  createFromExisting({id, createdAt, message, visitorId, articleId, userId}: {
    id: string, createdAt: Date, message: string, visitorId: string, articleId: string, userId: string | undefined
  }) {

    return new Comment(
        id, createdAt, message, visitorId, articleId, userId
    )
  }

}
