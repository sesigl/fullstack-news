import {PrismaClient, User as UserPO} from '@prisma/client'
import {injectable} from "tsyringe";
import UserRepository from "../../domain/entity/user/UserRepository";
import UserFactory from "../../domain/entity/user/UserFactory";
import User from "../../domain/entity/user/User";

@injectable()
export default class UserCockroachRepository implements UserRepository {

  constructor(private readonly prisma: PrismaClient, private readonly userFactory: UserFactory) {
  }

  async findUsers(userIds: string[]): Promise<Record<string, User>> {
    const userPOs = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      }
    })

    const resultMap: Record<string, User> = {}

    userPOs.forEach(userPO => {
      resultMap[userPO.id] = this.poToEntity(userPO)
    })

    return resultMap;
  }

  async upsert(user: User): Promise<User> {
    const userPO: Omit<UserPO, "createdAt" | "updatedAt"> = {
      id: user.id,
      email: user.email,
      auth0Id: user.auth0Id,
      allowNewsletter: user.profile.allowNewsletter,
      displayName: user.displayName,
      favoriteCategories: user.profile.favoriteCategories
    }

    let createdUser = await this.prisma.user.upsert({
      where: {id: userPO.id},
      update: userPO,
      create: userPO,
    });

    return this.poToEntity(createdUser);
  }

  async findById(id: string): Promise<User | undefined> {
    const userPO = await this.prisma.user.findUnique({
      where: {
        id: id
      }
    })
    return userPO ? this.poToEntity(userPO) : undefined;
  }


  async findByAuth0Id(auth0Id: string): Promise<User | undefined> {
    const userPO = await this.prisma.user.findUnique({
      where: {auth0Id: auth0Id}
    })
    return userPO ? this.poToEntity(userPO) : undefined;
  }

  private poToEntity(userPO: UserPO) {
    return this.userFactory.createFromExisting({
      id: userPO.id,
      email: userPO.email,
      auth0Id: userPO.auth0Id,
      displayName: userPO.displayName
    }, {allowNewsletter: userPO.allowNewsletter, favoriteCategories: userPO.favoriteCategories});
  }

}
