import {injectable} from "tsyringe";
import {CreateChallengeCommand} from "../../../interfaces/commands/CreateChallengeCommand";
import Challenge from "./Challenge";
import {v4 as uuidv4} from "uuid";
import {UpdateChallengeCommand} from "../../../interfaces/commands/UpdateChallengeCommand";
import {parseProgrammingLanguage} from "./ProgrammingLanugage";

@injectable()
export default class ChallengeFactory {

  create(createOrUpdateChallengeCommand: CreateChallengeCommand | UpdateChallengeCommand, creatorUserId: string, approved: boolean): Challenge {

    const id = createOrUpdateChallengeCommand.type === "update" ? createOrUpdateChallengeCommand.id : uuidv4()
    const {
      challengeName, description, goal, programmingLanguage, testCode,
      exampleSolution, templateSolution, articleIds
    } = createOrUpdateChallengeCommand


    return new Challenge(
        id,
        challengeName,
        description,
        goal,
        parseProgrammingLanguage(programmingLanguage),
        testCode,
        exampleSolution,
        templateSolution,
        creatorUserId,
        approved,
        articleIds
    )
  }
}
