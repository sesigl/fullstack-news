import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import NewsletterApplicationService
  from "../../libs/parser/application/NewsletterApplicationService";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {
    return response.status(400).send("")
  }

  if (!request.body.email) {
    response.status(400).send("email required")
    return
  }

  const newsletterApplicationService = container.resolve(NewsletterApplicationService)

  try {
    await newsletterApplicationService.addToNewsletter(request.body.email)
    response.status(201).send("")
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }

}

