import UserRepository from "../../../libs/parser/domain/entity/user/UserRepository";
import User from "../../../libs/parser/domain/entity/user/User";

export default class FakeUserRepository implements UserRepository {
  users: User[] = []

  async upsert(user: User): Promise<User> {
    const existingUser = await this.findById(user.id)

    if (existingUser) {
      this.users = this.users.filter(u => u.id !== existingUser.id)
    }

    this.users.push(user)

    return Promise.resolve(user);
  }

  findByAuth0Id(auth0Id: string): Promise<User | undefined> {
    const user = this.users.find(u => u.auth0Id === auth0Id)
    return Promise.resolve(user);
  }

  findById(id: string): Promise<User | undefined> {
    const user = this.users.find(u => u.id === id)
    return Promise.resolve(user);
  }

  findUsers(userIds: string[]): Promise<Record<string, User>> {
    const result: Record<string, User> = {}
    this.users.forEach(u => {
      result[u.id] = u
    })
    return Promise.resolve(result);
  }

}
