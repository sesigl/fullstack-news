import Challenge from "../../../libs/parser/domain/challenge/Challenge";
import ProgrammingLanguage from "../../../libs/parser/domain/challenge/ProgrammingLanugage";
import {v4 as uuidv4} from "uuid";

export default class ChallengeFakeFactory {

  getOneFor(userId: string, challengeName = "challengeName"): Challenge {
    return new Challenge(
        uuidv4(),
        challengeName,
        "description",
        "goal",
        ProgrammingLanguage.TYPESCRIPT,
        "testCode",
        "exampleSolution",
        "templateSolution",
        userId,
        true,
        [],
    )
  }

}
