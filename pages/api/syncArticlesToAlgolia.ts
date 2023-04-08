import {NextApiRequest, NextApiResponse} from "next";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import SyncArticlesApplicationService from "../../libs/parser/application/SyncArticlesApplicationService";

export const API_KEY = "a193mf833di82jmedkj3";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  if (request.query.key !== API_KEY) {
    response.status(400).send({error: 'invalid'})
  } else {

    let syncArticlesApplicationService = container.resolve(SyncArticlesApplicationService);

    const articles = await syncArticlesApplicationService.syncAlgolia()

    response.status(200).json(articles)
  }

}