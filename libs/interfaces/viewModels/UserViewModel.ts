export default interface UserViewModel {
  id: string,
  email: string,
  auth0Id: string,
  displayName: string,
  allowNewsletter: boolean,
  favoriteCategories: string[],
}
