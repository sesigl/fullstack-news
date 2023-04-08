import {PrismaClient, Vote as VotePO} from '@prisma/client'
import Vote from "../../domain/entity/vote/Vote";
import {injectable} from "tsyringe";
import VoteRepository, {ArticleVote} from "../../domain/entity/vote/VoteRepository";

@injectable()
export default class VoteCockroachRepository implements VoteRepository {

  constructor(private readonly prisma: PrismaClient) {
  }

  async addVote(vote: Vote): Promise<Vote> {
    const votePO: VotePO = {
      articleId: vote.articleId,
      visitorId: vote.visitorId,
      value: vote.value,
      createdAt: vote.createdAt,
      userId: null
    }

    let updatedVotePO = await this.prisma.vote.create({
      data: votePO
    });

    return this.poToEntity(updatedVotePO);
  }

  async removeVote(articleId: string, visitorId: string): Promise<void> {
    await this.prisma.vote.delete({
      where: {
        visitorId_articleId: {
          articleId: articleId,
          visitorId: visitorId
        }
      }
    })
  }

  async hasVote(articleIds: string[], visitorId: string): Promise<ArticleVote[]> {
    let votePOsPromise = this.prisma.vote.findMany({
      where: {
        articleId: {
          in: articleIds
        },
        visitorId: visitorId
      }
    });

    let countPromise = this.prisma.vote.groupBy({
      _count: {
        articleId: true
      },
      where: {
        articleId: {
          in: articleIds
        }
      },
      by: ['articleId']
    });

    const [votePOs, count] = await Promise.all([votePOsPromise, countPromise])

    return articleIds.map(articleId => {
      return {
        articleId: articleId,
        hasVoted: !!votePOs.find(votePO => votePO.articleId === articleId),
        voteCount: count.find(c => c.articleId === articleId)?._count.articleId ?? 0
      }
    })
  }

  async getVoteCountFor(articleId: string): Promise<number> {
    return await this.prisma.vote.count({
      where: {
        articleId: articleId,
      }
    });
  }

  private poToEntity(updatedVotePO: VotePO) {
    return new Vote(updatedVotePO.createdAt, updatedVotePO.value, updatedVotePO.visitorId, updatedVotePO.articleId);
  }

}
