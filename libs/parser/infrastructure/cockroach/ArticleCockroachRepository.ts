import ArticleRepository from "../../domain/entity/article/ArticleRepository";
import Article from "../../domain/entity/article/Article";
import {
  Article as ArticlePO,
  Comment as CommentPO,
  Challenge as ChallengePO,
  PrismaClient,
  User as UserPO,
  Vote as VotePO
} from '@prisma/client'
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {injectable} from "tsyringe";
import ArticleWithRelations from "../../domain/entity/article/ArticleWithRelations";
import Vote from "../../domain/entity/vote/Vote";
import Challenge from "../../domain/challenge/Challenge";
import {parseProgrammingLanguage} from "../../domain/challenge/ProgrammingLanugage";

@injectable()
export default class ArticleCockroachRepository implements ArticleRepository {

  constructor(private readonly prisma: PrismaClient, private readonly articleFactory: ArticleFactory) {
  }

  async findAll(): Promise<Article[]> {
    const articlePOs = await this.prisma.article.findMany({
      include: {
        votes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return articlePOs.map(po => {
      return this.poToEntity(po)
    })
  }

  async findByLink(link: string): Promise<Article[]> {
    const articlePOs = await this.prisma.article.findMany({
      include: {
        votes: true
      },
      where: {
        link: link
      }
    })
    return articlePOs.map(po => {
      return this.poToEntity(po)
    })
  }

  private poToEntity(po: ArticlePO) {
    return this.articleFactory.createFromExisting({
      author: po.author,
      createdAt: po.createdAt,
      description: po.description,
      id: po.id,
      link: po.link,
      imageLink: po.imageLink,
      tags: po.tags,
      mlTags: po.ml_categories,
      title: po.title,
      updatedAt: po.updatedAt,
      parsedAt: po.parsedAt,
      articleSourceId: po.articleSourceId
    });
  }

  async insert(article: Article): Promise<Article> {
    const po: Omit<ArticlePO, "createdAt" | "updatedAt"> = {
      author: article.author,
      description: article.description,
      id: article.id,
      link: article.link,
      imageLink: article.imageLink,
      tags: article.tags,
      title: article.title,
      parsedAt: article.parsedAt,
      articleSourceId: article.articleSourceId,
      ml_categories: []
    }

    let updatedArticlePO = await this.prisma.article.create({
      data: po,
    });

    return this.poToEntity(updatedArticlePO);
  }

  async findByArticleId(articleId: string): Promise<Article | undefined> {
    const article = await this.prisma.article.findUnique({
      where: {
        id: articleId
      }
    })

    if (article) {
      return this.poToEntity(article)
    } else {
      return undefined
    }

  }

  async findAllWithRelations(): Promise<ArticleWithRelations[]> {
    const articlePOs = (await this.prisma.article.findMany({
      include: {
        challenges: true,
        votes: true,
        comments: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
    }))

    return articlePOs.map(po => {
      return this.poToEntityWithRelations(po)
    })
  }

  private poToEntityWithRelations(
      po: (ArticlePO & { votes: VotePO[], comments: (CommentPO & { user: UserPO | null })[], challenges: ChallengePO[] })) {

    return this.articleFactory.createWithRelationsFromExisting({
      author: po.author,
      createdAt: po.createdAt,
      description: po.description,
      id: po.id,
      link: po.link,
      imageLink: po.imageLink,
      tags: po.tags,
      mlTags: po.ml_categories,
      title: po.title,
      updatedAt: po.updatedAt,
      parsedAt: po.parsedAt,
      comments: po.comments.map(c => ({
        id: c.id,
        articleId: c.articleId,
        message: c.message,
        visitorId: c.visitorId,
        createdAt: c.createdAt,
        user: c.user ?? undefined
      })),
      votes: po.votes.map((v: VotePO) => new Vote(v.createdAt, v.value, v.visitorId, v.articleId)),
      articleSourceId: po.articleSourceId,
      challenges: po.challenges.map(cpo => new Challenge(
          cpo.id,
          cpo.challengeName,
          cpo.description,
          cpo.goal,
          parseProgrammingLanguage(cpo.programmingLanguage),
          cpo.testCode,
          cpo.exampleSolution,
          cpo.templateSolution,
          cpo.creatorUserId,
          cpo.approved,
          [], // circular dependency, to resolve it we just use an empty list
      ))
    });
  }

}
