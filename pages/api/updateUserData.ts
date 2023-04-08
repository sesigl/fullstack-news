import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import * as auth0 from "@auth0/nextjs-auth0";
import UserApplicationService from "../../libs/parser/application/user/UserApplicationService";
import {toUserViewModel} from "../profile";

let container = ContainerProvider.getContainerProvider();

export async function handler(request: NextApiRequest,
                              response: NextApiResponse) {

  const userApplicationService = container.resolve(UserApplicationService)

  let session: ReturnType<typeof auth0.getSession>

  session = auth0.getSession(request, response);

  if (!session) {
    response.status(401).send("")
    return
  }

  if (request.body.allowNewsletter === undefined) {
    response.status(400).send("allowNewsletter required")
    return
  }

  if (request.body.displayName === undefined) {
    response.status(400).send("displayName required")
    return
  }

  if (request.body.favoriteCategories === undefined) {
    response.status(400).send("favoriteCategories required")
    return
  }

  try {
    const updatedUser = await userApplicationService.updateUserData(session.user.sub, {
      allowNewsletter: request.body.allowNewsletter,
      displayName: request.body.displayName,
      favoriteCategories: request.body.favoriteCategories,
    })

    response.status(200).json(toUserViewModel(updatedUser))
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }

}

export default auth0.withApiAuthRequired(handler)
