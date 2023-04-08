import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import VoteApplicationService from "../../libs/parser/application/VoteApplicationService";

let container = ContainerProvider.getContainerProvider();


export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {


  const upVoteApplicationService = container.resolve(VoteApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {
    return response.status(400).send("")
  }

  if (!request.body.articleId) {
    response.status(400).send("articleId required")
  }

  if (!Array.isArray(request.body.articleId)) {
    response.status(400).send("articleId must be an array")
  }

  try {
    const hasVoted = await upVoteApplicationService.hasVoted(request.body.articleId, jwtPayload.visitorId)

    response.status(200).json(hasVoted)

  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}
