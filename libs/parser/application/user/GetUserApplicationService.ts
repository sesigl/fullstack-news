import User from "../../domain/entity/user/User";

export default interface GetUserApplicationService {

  getUserByAuth0Id(auth0Id: string): Promise<User | undefined>

}
