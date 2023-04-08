import {NextApiRequest, NextApiResponse} from "next";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import * as auth0 from "@auth0/nextjs-auth0";
import ArticleSourcesApplicationService
  from "../../libs/parser/application/ArticleSourcesApplicationService";
import UserApplicationService from "../../libs/parser/application/user/UserApplicationService";
import GetArticlesApplicationServices
  from "../../libs/parser/application/GetArticlesApplicationServices";
import {
  toArticleSourceOverviewViewModel
} from "../../libs/interfaces/viewModels/ArticleSourceOverviewViewModel";

let container = ContainerProvider.getContainerProvider();

export async function handler(request: NextApiRequest,
                              response: NextApiResponse) {

  const articleSourcesApplicationService = container.resolve(ArticleSourcesApplicationService)
  const userApplicationService = container.resolve(UserApplicationService)
  const getArticlesApplicationServices = container.resolve(GetArticlesApplicationServices)

  let session: ReturnType<typeof auth0.getSession>

  session = auth0.getSession(request, response);

  if (!session) {
    response.status(401).send("")
    return
  }

  let auth0Id = session.user.sub;
  const user = await userApplicationService.getUserByAuth0Id(auth0Id)

  if (!user) {
    response.status(401).send("")
    return
  }

  try {
    const articleSources = await articleSourcesApplicationService.getAllFor(user.id)
    const articles = await getArticlesApplicationServices.getAllArticles()

    response.status(200).json(articleSources.map(as => toArticleSourceOverviewViewModel(as, articles)))
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}


export default auth0.withApiAuthRequired(handler)
