import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import VoteApplicationService from "../../libs/parser/application/VoteApplicationService";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {


  const addVotesToArticleApplicationService = container.resolve(VoteApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  if (!request.body.articleId) {
    response.status(400).send("articleId required")
  }

  try {
    const updatedArticle = await addVotesToArticleApplicationService.removeVote(request.body.articleId, jwtPayload.visitorId)

    if (!updatedArticle) {
      response.status(404).send("Article not found")
    } else {
      response.status(201).json(updatedArticle)
    }
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }


  // await container(request, response);
}