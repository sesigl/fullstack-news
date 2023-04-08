import {CreateChallengeCommand} from "./CreateChallengeCommand";

export interface UpdateChallengeCommand extends Omit<CreateChallengeCommand, "type"> {
  type: "update"
  id: string,
}
