import {NextApiRequest, NextApiResponse} from "next";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import CategoryImageCockroachRepository
  from "../../libs/parser/infrastructure/cockroach/CategoryImageCockroachRepository";

export const API_KEY = "a193mf833di82jmedkj3";

let container = ContainerProvider.getContainerProvider();

const images = [
  'ai',
  'aws',
  'container',
  'data-analytics',
  'database',
  'deno',
  'docker',
  'excel',
  'git',
  'html',
  'java',
  'javascript',
  'learning-to-code',
  'linux',
  'love2d',
  'machine-learning',
  'monorepos',
  'node',
  'other',
  'python',
  'react',
  'self-improvement',
  'server-side-rendering',
  'software-testing',
  'sql',
  'tailwind',
  'typescript',
  'web-components',
  'web-development',
  'webpack',
  'windows',
  'yarn'
]

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  if (request.query.key !== API_KEY) {
    response.status(400).send({error: 'invalid'})
  } else {

    let categoryImageCockroachRepository = container.resolve(CategoryImageCockroachRepository);

    await categoryImageCockroachRepository.syncCategoryImages(images)

    response.status(200).send('')
  }

}
