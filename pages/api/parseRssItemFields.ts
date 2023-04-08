import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import FetchNewArticleApplicationService
  from "../../libs/parser/application/FetchNewArticleApplicationService";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {


  const fetchNewArticleApplicationService = container.resolve(FetchNewArticleApplicationService)

  let jwtPayload = await isJwtTokenValid(request, response);

  if (!jwtPayload) {

    return response.status(400).send("")
  }

  if (!request.body.rssFeedUrl) {
    response.status(400).send("Not all information provided")
  }

  try {
    const keysWithExample: Record<string, string> = await fetchNewArticleApplicationService.parseRssFeedItemKeyAndValues(request.body.rssFeedUrl)

    const rssFeedKeysWithExamplesViewModel: RssFeedKeysWithExamplesViewModel = {
      data: []
    }

    Object.entries(keysWithExample).forEach((record) => {
      rssFeedKeysWithExamplesViewModel.data.push({key: record[0], exampleValue: record[1]})
    })

    response.status(200).json(rssFeedKeysWithExamplesViewModel)
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}

export interface RssFeedKeysWithExamplesViewModel {
  data: { key: string, exampleValue: string }[]
}
