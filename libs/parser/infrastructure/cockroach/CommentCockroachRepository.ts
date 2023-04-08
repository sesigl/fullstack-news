import {Comment as CommentPO, PrismaClient} from '@prisma/client'
import Comment from "../../domain/entity/comment/Comment";
import {injectable} from "tsyringe";
import CommentRepository from "../../domain/entity/comment/CommentRepository";
import CommentFactory from "../../domain/entity/comment/CommentFactory";

@injectable()
export default class CommentCockroachRepository implements CommentRepository {

  constructor(private readonly prisma: PrismaClient, private readonly commentFactory: CommentFactory) {
  }

  async addComment(comment: Comment): Promise<Comment> {
    const commentPO: CommentPO = {
      id: comment.id,
      articleId: comment.articleId,
      visitorId: comment.visitorId,
      message: comment.message,
      createdAt: comment.createdAt,
      userId: comment.userId ?? null
    }

    let updatedCommentPO = await this.prisma.comment.create({
      data: commentPO
    });

    return this.poToEntity(updatedCommentPO);
  }

  async getCommentCountFor(articleId: string): Promise<number> {
    return await this.prisma.comment.count({
      where: {
        articleId: articleId,
      }
    });
  }

  async getCommentsFor(articleIds: string[]): Promise<Comment[]> {
    const commentPOs = await this.prisma.comment.findMany({
      where: {
        articleId: {
          in: articleIds
        },
      }
    });

    return commentPOs.map(po => this.commentFactory.createFromExisting({
      id: po.id,
      message: po.message,
      visitorId: po.visitorId,
      articleId: po.articleId,
      createdAt: po.createdAt,
      userId: po.userId ?? undefined
    }))
  }

  async getCommentCountForArticleAndUser(articleId: string, visitorId: string): Promise<number> {
    const commentPOs = await this.prisma.comment.findMany({
      where: {
        articleId: articleId,
        userId: visitorId
      }
    });

    return commentPOs.length
  }

  private poToEntity(commentPO: CommentPO) {
    return new Comment(commentPO.id, commentPO.createdAt, commentPO.message, commentPO.visitorId, commentPO.articleId, commentPO.userId ?? undefined);
  }

}
