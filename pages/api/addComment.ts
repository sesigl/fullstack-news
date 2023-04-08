import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import CommentApplicationService from "../../libs/parser/application/CommentApplicationService";
import * as auth0 from "@auth0/nextjs-auth0";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {


  const commentApplicationService = container.resolve(CommentApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  const session = auth0.getSession(request, response);

  if (!request.body.articleId) {
    response.status(400).send("articleId required")
    return
  }

  if (!request.body.message) {
    response.status(400).send("message required")
    return
  }

  if (request.body.message.length > 160) {
    response.status(400).send("message too long")
    return
  }

  try {
    const updatedArticle = await commentApplicationService.addComment(request.body.message, request.body.articleId, jwtPayload.visitorId, session?.user?.sub)

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
