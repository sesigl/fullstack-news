import CommentRepository from "../../../libs/parser/domain/entity/comment/CommentRepository";
import Comment from "../../../libs/parser/domain/entity/comment/Comment";

export default class FakeCommentRepository implements CommentRepository {
  comments: Comment[] = []

  addComment(comment: Comment): Promise<Comment> {
    this.comments.push(comment)
    return Promise.resolve(comment);
  }

  getCommentCountFor(articleId: string): Promise<number> {
    const matchingComments = this.comments.filter(v => v.articleId === articleId)
    return Promise.resolve(matchingComments.length);
  }

  getCommentsFor(articleIds: string[]): Promise<Comment[]> {
    const matchingComments = this.comments.filter(v => articleIds.includes(v.articleId))

    return Promise.resolve(matchingComments);
  }

  getCommentCountForArticleAndUser(articleId: string, visitorId: string): Promise<number> {
    const matchingComments = this.comments.filter(v => v.articleId === articleId && v.visitorId === visitorId)
    return Promise.resolve(matchingComments.length);
  }

}