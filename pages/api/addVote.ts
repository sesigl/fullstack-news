import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import VoteApplicationService from "../../libs/parser/application/VoteApplicationService";
import * as auth0 from "@auth0/nextjs-auth0";
import GetUserApplicationService
  from "../../libs/parser/application/user/GetUserApplicationService";
import User from "../../libs/parser/domain/entity/user/User";

let container = ContainerProvider.getContainerProvider();

export async function handler(request: NextApiRequest,
                              response: NextApiResponse) {


  const addVotesToArticleApplicationService = container.resolve(VoteApplicationService)
  const userApplicationService = container.resolve<GetUserApplicationService>("GetUserApplicationService")

  let jwtPayload = await isJwtTokenValid(request, response);
  const session = auth0.getSession(request, response);

  let user: User | undefined = undefined
  if (session) {
    user = await userApplicationService.getUserByAuth0Id(session.user.sub)
  }

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  if (!request.body.articleId) {
    response.status(400).send("articleId required")
  }

  try {
    const updatedArticle = await addVotesToArticleApplicationService.addVote(request.body.articleId, user?.id ?? jwtPayload.visitorId)

    if (!updatedArticle) {
      response.status(404).send("Article not found")
    } else {
      response.status(201).json(updatedArticle)
    }
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}

export default handler
