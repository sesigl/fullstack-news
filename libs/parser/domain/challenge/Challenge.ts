import ProgrammingLanguage from "./ProgrammingLanugage";

export default class Challenge {

  constructor(public id: string,
              public challengeName: string,
              public description: string,
              public goal: string,
              public programmingLanguage: ProgrammingLanguage,
              public testCode: string,
              public exampleSolution: string,
              public templateSolution: string,
              public creatorUserId: string | null,
              public approved: boolean,
              public articleIds: string[]
  ) {
  }

  connectToArticle(articleId: string) {
    this.articleIds.push(articleId)
  }
}
