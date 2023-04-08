import GetUserApplicationService
  from "../../../libs/parser/application/user/GetUserApplicationService";
import User from "../../../libs/parser/domain/entity/user/User";

export default class FakeGetUserApplicationService implements GetUserApplicationService {

  public user: User | undefined = undefined

  getUserByAuth0Id(auth0Id: string): Promise<User | undefined> {
    return Promise.resolve(this.user);
  }

}
