import Challenge from "../../parser/domain/challenge/Challenge";
import ProgrammingLanguageViewModel, {
  parseProgrammingLanguageViewModel
} from "../../../pages/api/challenge/ProgrammingLanguageViewModel";

export default interface ChallengeViewModel {
  id: string

  name: string,
  description: string,
  goal: string,

  language: ProgrammingLanguageViewModel,

  testCode: string,
  exampleSolution: string,
  templateSolution: string,

  articleIds: string[]

  creatorUserId: string | null,
  approved: boolean,
}


export function toChallengeViewModel(challenge: Challenge): ChallengeViewModel {

  return {
    id: challenge.id,

    name: challenge.challengeName,
    description: challenge.description,
    goal: challenge.goal,

    testCode: challenge.testCode,
    exampleSolution: challenge.exampleSolution,
    templateSolution: challenge.templateSolution,

    articleIds: challenge.articleIds,

    language: parseProgrammingLanguageViewModel(challenge.programmingLanguage),

    creatorUserId: challenge.creatorUserId,
    approved: challenge.approved
  }
}
