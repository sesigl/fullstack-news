import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import {isJwtTokenValid} from "../../libs/api/auth";
import {
  CreateArticleSourceCommand
} from "../../libs/interfaces/commands/CreateArticleSourceCommand";
import FetchNewArticleApplicationService
  from "../../libs/parser/application/FetchNewArticleApplicationService";
import Article from "../../libs/parser/domain/entity/article/Article";
import getArticlePageLink
  from "../../libs/parser/domain/entity/article/functions/getArticlePageLink";
import getBaseUrlFromUrl from "../../libs/parser/domain/entity/article/functions/getBaseUrlFromUrl";
import Post from "../../libs/interfaces/viewModels/Post";

let container = ContainerProvider.getContainerProvider();

function articleToPost(article: Article) {
  return {
    id: "id",
    content: "content",
    slug: "slug",
    frontmatter: {
      articlePageLink: getArticlePageLink(article),
      image: article.imageLink,
      title: article.title,
      description: article.description,
      time_to_read_in_minutes: 10,
      date: article.parsedAt.toISOString(),
      author: article.author,
      category: article.tags[0] ?? null,
      tags: article.tags,
      group: "Regular",
      views: 0,
      link: article.link,
      baseLink: getBaseUrlFromUrl(article.link),
      upVoteCount: 0,
      commentCount: 0,
      comments: [],
      hasVoted: false,
      challenges: []
    }
  } as Post;
}

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

  const createArticleSourceCommand: CreateArticleSourceCommand = {
    id: 'not-defined',
    rssFeedUrl: request.body.rssFeedUrl,
    parseConfiguration: request.body.parseConfiguration,
  }

  try {
    const articles: Article[] = await fetchNewArticleApplicationService.parseArticleSource(createArticleSourceCommand)
    const posts: Post[] = articles.map(article => articleToPost(article))

    response.status(200).json(posts)
  } catch (e) {
    response.status(500).send("")
    console.error(e)
  }
}
