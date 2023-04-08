export interface CreateChallengeCommand {
  type: "create"

  // meta information
  challengeName: string,
  description: string,
  goal: string,

  // code
  programmingLanguage: string,
  testCode: string,
  exampleSolution: string,
  templateSolution: string,

  articleIds: string[]

  // access management
  auth0UserId: string,
}
