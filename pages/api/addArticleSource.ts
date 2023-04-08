import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import * as auth0 from "@auth0/nextjs-auth0";
import ArticleSourcesApplicationService
  from "../../libs/parser/application/ArticleSourcesApplicationService";
import {
  CreateArticleSourceCommand
} from "../../libs/interfaces/commands/CreateArticleSourceCommand";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {


  const articleSourcesApplicationService = container.resolve(ArticleSourcesApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  const session = auth0.getSession(request, response);


  try {

    const createArticleSourceCommand: CreateArticleSourceCommand = {
      id: request.body.id,
      rssFeedUrl: request.body.rssFeedUrl,
      parseConfiguration: request.body.parseConfiguration,
    }

    if (!createArticleSourceCommand.rssFeedUrl
        || !createArticleSourceCommand.parseConfiguration) {
      response.status(400).send("not all parameters provided")
      return
    }


    const auth0Id = session?.user?.sub
    const createdArticleSource = await articleSourcesApplicationService.add(createArticleSourceCommand, auth0Id)

    if (!createdArticleSource) {
      response.status(404).send("Article not found")
    } else {
      response.status(201).json(createdArticleSource)
    }
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}
