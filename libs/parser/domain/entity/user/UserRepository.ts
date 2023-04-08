import User from "./User";

export default interface UserRepository {
  upsert(user: User): Promise<User>;

  findById(id: string): Promise<User | undefined>;

  findByAuth0Id(auth0Id: string): Promise<User | undefined>;

  findUsers(userIds: string[]): Promise<Record<string, User>>;
}
