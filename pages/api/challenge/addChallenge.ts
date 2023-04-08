import ContainerProvider
  from "../../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../../libs/api/auth";
import * as auth0 from "@auth0/nextjs-auth0";
import {CreateChallengeCommand} from "../../../libs/interfaces/commands/CreateChallengeCommand";
import ChallengeApplicationService
  from "../../../libs/parser/application/ChallengeApplicationService";
import {UpdateChallengeCommand} from "../../../libs/interfaces/commands/UpdateChallengeCommand";

let container = ContainerProvider.getContainerProvider();

export async function handler(request: NextApiRequest,
                              response: NextApiResponse) {


  const challengeApplicationService = container.resolve(ChallengeApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  const session = auth0.getSession(request, response);


  try {

    const createChallengeCommand: CreateChallengeCommand | UpdateChallengeCommand = {
      id: request.body.id ?? undefined,
      type: request.body.id ? "update" : "create",

      challengeName: request.body.challengeName,
      description: request.body.description,
      goal: request.body.goal,

      programmingLanguage: request.body.programmingLanguage,
      exampleSolution: request.body.exampleSolution,
      templateSolution: request.body.templateSolution,
      testCode: request.body.testCode,

      articleIds: request.body.articleIds,

      auth0UserId: session?.user?.sub
    }

    let allElementsFilled = true;

    const incompleteParameters: string[] = []

    Object.entries(createChallengeCommand).some(([key, value]) => {
      if (key !== "id" && key !== "articleIds" && (!value || value.trim() === "")) {
        allElementsFilled = false
        incompleteParameters.push(JSON.stringify(key))
      } else if (key === "articleIds" && !Array.isArray(value)) {
        allElementsFilled = false
        incompleteParameters.push(JSON.stringify(key))
      }
    })

    if (
        !createChallengeCommand.auth0UserId || !allElementsFilled
    ) {
      response.status(400).send("Missing required parameters: " + incompleteParameters.join(', '))
      return
    }

    const createdChallenge = await challengeApplicationService.createOrUpdate(createChallengeCommand)

    if (!createdChallenge) {
      response.status(404).send("Challenge not found")
    } else {
      response.status(201).json(createdChallenge)
    }
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}

export default auth0.withApiAuthRequired(handler)
