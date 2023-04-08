import {NextApiRequest, NextApiResponse} from "next";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import GetArticlesApplicationServices
  from "../../libs/parser/application/GetArticlesApplicationServices";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  let getArticlesApplicationServices = container.resolve(GetArticlesApplicationServices);
  const articles = await getArticlesApplicationServices.getAllArticles()
  response.status(200).json(articles)
}