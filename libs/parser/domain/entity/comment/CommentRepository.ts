import Comment from "../comment/Comment";

export default interface CommentRepository {

  addComment(comment: Comment): Promise<Comment>

  getCommentCountFor(articleId: string): Promise<number>;

  getCommentsFor(articleIds: string[]): Promise<Comment[]>;

  getCommentCountForArticleAndUser(articleId: string, visitorId: string): Promise<number>;
}