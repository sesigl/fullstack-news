import ChallengeRepository from "../../domain/challenge/ChallengeRepository";
import Challenge from "../../domain/challenge/Challenge";
import {
  parseProgrammingLanguage
} from "../../domain/challenge/ProgrammingLanugage";
import {
  PrismaClient,
  Challenge as ChallengePO,
  Article as ArticlePO,
} from "@prisma/client";
import {injectable} from "tsyringe";

@injectable()
export default class ChallengeCockroachRepository implements ChallengeRepository {

  constructor(private readonly prisma: PrismaClient) {
  }

  async findAll(): Promise<Challenge[]> {
    const pos: (ChallengePO & { articles: ArticlePO[] })[] = await this.prisma.challenge.findMany({
      include: {
        articles: true
      }
    })

    return pos.map(po => this.poToEntity(po));
  }

  async findAllByUserId(userId: string): Promise<Challenge[]> {
    const pos: (ChallengePO & { articles: ArticlePO[] })[] = await this.prisma.challenge.findMany({
      where: {
        creatorUserId: userId
      },
      include: {
        articles: true
      }
    })

    return pos.map(po => this.poToEntity(po));
  }

  async findById(challengeId: string): Promise<Challenge | null> {
    const po: (ChallengePO & { articles: ArticlePO[] }) | null = await this.prisma.challenge.findFirst({
      where: {
        id: challengeId
      },
      include: {
        articles: true
      }
    })

    return po ? this.poToEntity(po) : null;
  }

  async upsertChallenge(challenge: Challenge): Promise<Challenge> {

    let existingChallenge = await this.findById(challenge.id)

    let newChallenge
    if (existingChallenge) {
      newChallenge = await this.prisma.challenge.update({
        where: {
          id: existingChallenge.id
        },
        data: {
          ...this.entityToPo(challenge),
          articles: challenge.articleIds.length > 0 ? {
            connect:
                challenge.articleIds.map(aid => ({id: aid}))
          } : undefined
        },
        include: {
          articles: true
        }
      })
    } else {
      newChallenge = await this.prisma.challenge.create({
        data: {
          ...this.entityToPo(challenge),
          articles: challenge.articleIds.length > 0 ? {
            connect:
                challenge.articleIds.map(aid => ({id: aid}))
          } : undefined
        },
        include: {
          articles: true
        }
      })
    }

    return this.poToEntity(newChallenge)
  }

  async findAllByArticleIds(articleIds: string[]): Promise<Challenge[]> {
    const pos: (ChallengePO & { articles: ArticlePO[] })[] = await this.prisma.challenge.findMany({
      where: {
        articles: {
          some: {
            id: {
              in: articleIds
            }
          }
        }
      },
      include: {
        articles: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return pos.map(po => this.poToEntity(po));
  }

  private poToEntity(po: ChallengePO & { articles: ArticlePO[] }) {
    return new Challenge(
        po.id,
        po.challengeName,
        po.description,
        po.goal,
        parseProgrammingLanguage(po.programmingLanguage),
        po.testCode,
        po.exampleSolution,
        po.templateSolution,
        po.creatorUserId,
        po.approved,
        po.articles.map(a => a.id),
    )
  }

  private entityToPo(challenge: Challenge) {
    const po: Omit<ChallengePO, "createdAt" | "updatedAt"> = {
      id: challenge.id,
      challengeName: challenge.challengeName,
      description: challenge.description,
      goal: challenge.goal,
      programmingLanguage: challenge.programmingLanguage,
      testCode: challenge.testCode,
      exampleSolution: challenge.exampleSolution,
      templateSolution: challenge.templateSolution,
      approved: challenge.approved,
      creatorUserId: challenge.creatorUserId,
    }

    return po
  }
}
