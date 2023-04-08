import {NextApiRequest, NextApiResponse} from "next";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import FetchNewArticleApplicationService
  from "../../libs/parser/application/FetchNewArticleApplicationService";

export const API_KEY = "a193mf833di82jmedkj3";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  if (request.query.key !== API_KEY) {
    response.status(400).send({error: 'invalid'})
  } else {

    let fetchNewArticleApplicationService = container.resolve(FetchNewArticleApplicationService);

    let limit = request.query?.limit as string | undefined;
    const articles = await fetchNewArticleApplicationService.fetchAndStoreNewArticles(limit ? Number.parseInt(limit) : 0)

    response.status(200).json(articles)
  }

}
