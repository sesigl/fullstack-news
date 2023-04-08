import "reflect-metadata"

import {NextApiRequest, NextApiResponse} from "next";
import ChallengeApplicationService
  from "../../../libs/parser/application/ChallengeApplicationService";
import * as auth0 from "@auth0/nextjs-auth0";
import {z} from "zod";
import ContainerProvider
  from "../../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import RunCodeResult from "../../../libs/parser/domain/challenge/RunCodeResult";

const zodTypeDefinition = z.object({
  challengeId: z.string(),
  solutionCode: z.string(),
});

export type RunChallengeRequestDto = z.infer<typeof zodTypeDefinition> // string

const container = ContainerProvider.getContainerProvider()

export async function handler(request: NextApiRequest,
                              response: NextApiResponse) {

  const session = auth0.getSession(request, response);
  if (!session?.user?.sub) {
    response.status(400).send("Unknown user")
    return
  }

  const bodyParseResult = zodTypeDefinition.safeParse(request.body)

  if (!bodyParseResult.success) {
    response.status(400).send(bodyParseResult.error.message)
    return
  }

  const challengeApplicationService: ChallengeApplicationService = container.resolve(ChallengeApplicationService)


  const reply: RunCodeResult = await challengeApplicationService.runChallengeSolution(bodyParseResult.data, session.user.sub as string)

  response.status(200).json(reply)
}

export default auth0.withApiAuthRequired(handler)
