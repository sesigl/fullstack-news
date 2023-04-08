import Profile from "./Profile";

export default class User {

  constructor(public id: string, public email: string, public auth0Id: string, public displayName: string, public profile: Profile) {
  }

  setDisplayName(displayName: string) {
    this.displayName = displayName
  }

  setAllowNewsletter(allowNewsletter: boolean) {
    this.profile.allowNewsletter = allowNewsletter
  }

  setFavoriteCategories(favoriteCategories: string[]) {
    this.profile.favoriteCategories = [...favoriteCategories]
  }
}
