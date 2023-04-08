import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import * as auth0 from "@auth0/nextjs-auth0";
import GetArticlesApplicationServices
  from "../../libs/parser/application/GetArticlesApplicationServices";
import SortMode from "../../libs/interfaces/SortMode";
import GetUserApplicationService
  from "../../libs/parser/application/user/GetUserApplicationService";
import Post from "../../libs/interfaces/viewModels/Post";

let container = ContainerProvider.getContainerProvider();

export async function handler(request: NextApiRequest,
                              response: NextApiResponse) {

  const getArticlesApplicationServices = container.resolve(GetArticlesApplicationServices)
  const userApplicationService = container.resolve<GetUserApplicationService>("GetUserApplicationService")

  let session: ReturnType<typeof auth0.getSession>

  session = auth0.getSession(request, response);

  if (!session) {
    response.status(200).json([])
    return
  }

  try {
    const user = await userApplicationService.getUserByAuth0Id(session.user.sub)

    let personalizedPosts: Post[] = []

    if (user?.id) {
      personalizedPosts = await getArticlesApplicationServices.getArticlesConsideringFavoriteCategories(
          user.profile.favoriteCategories,
          request.query.sort ? request.query.sort as SortMode : SortMode.HOT,
          user.id
      )
    }

    response.status(200).json(personalizedPosts)
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }

}

export default auth0.withApiAuthRequired(handler)
