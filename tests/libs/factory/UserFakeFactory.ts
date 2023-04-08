import UserFactory from "../../../libs/parser/domain/entity/user/UserFactory";
import User from "../../../libs/parser/domain/entity/user/User";

export default class UserFakeFactory {

  getOne(): User {
    return (new UserFactory()).create({
      auth0Id: "auth0Id",
      email: "example@mail.com",
    })
  }

  getWithCategory(category: string): User {
    let user = (new UserFactory()).create({
      auth0Id: "auth0Id",
      email: "example@mail.com",
    });
    user.setFavoriteCategories([category])
    return user
  }

}
