import {PrismaClient} from "@prisma/client";
import {injectable} from "tsyringe";

@injectable()
export default class DatabaseCleaner {

  constructor(private readonly prisma: PrismaClient) {
  }

  async truncateAllTables(): Promise<void> {
    await this.prisma.$transaction([
          this.prisma.user.deleteMany(),
          this.prisma.vote.deleteMany(),
          this.prisma.article.deleteMany(),
          this.prisma.comment.deleteMany(),
          this.prisma.articleSource.deleteMany(),
          this.prisma.challenge.deleteMany(),
        ]
    )
  }
}
