import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import CommentApplicationService from "../../libs/parser/application/CommentApplicationService";
import {CommentView} from "../../libs/getPosts";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {


  const commentApplicationService = container.resolve<CommentApplicationService>(CommentApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  if (!request.body.articleId) {
    response.status(400).send("articleId required")
  }

  try {
    const comments = await commentApplicationService.getCommentsFor(request.body.articleId as string[])

    const commentViews: CommentView[] = comments.map(comment => ({
      articleId: comment.articleId,
      id: comment.id,
      message: comment.message,
      createdAt: comment.createdAt.toISOString(),
      user: comment.user ?? null
    }))

    if (!comments) {
      response.status(404).send("Comments not found")
    } else {
      response.status(201).json(commentViews)
    }
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}
