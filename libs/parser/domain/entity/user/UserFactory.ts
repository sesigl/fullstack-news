import User from "./User";
import Profile from "./Profile";
import {injectable} from "tsyringe";
import {v4 as uuidv4} from "uuid";

interface UserSettings {
  id: string,
  email: string,
  auth0Id: string,
  displayName: string,
}

interface ProfileSettings {
  allowNewsletter: boolean,
  favoriteCategories: string[],
}

@injectable()
export default class UserFactory {

  create(userSettings: Omit<UserSettings, "id" | "displayName">) {

    const defaultDisplayName = userSettings.email.split('@')[0]

    return new User(uuidv4(),
        userSettings.email,
        userSettings.auth0Id,
        defaultDisplayName,
        new Profile(false, [])
    )
  }

  createFromExisting(userSettings: UserSettings, profileSettings: ProfileSettings) {
    return new User(
        userSettings.id,
        userSettings.email,
        userSettings.auth0Id,
        userSettings.displayName,
        new Profile(profileSettings.allowNewsletter, profileSettings.favoriteCategories)
    )
  }

}
