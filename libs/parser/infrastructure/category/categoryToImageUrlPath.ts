import {staticAssetsBasePath} from "../../../configuration";
import CategoryImageCockroachRepository from "../cockroach/CategoryImageCockroachRepository";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import CloudwatchMetricPublisher from "../metrics/CloudwatchMetricPublisher";


export const DEFAULT_IMAGE = '/images/categories/other.jpeg';

const existsFetchCache: Record<string, boolean> = {}

async function filenameExists(filename: string) {
  const container = ContainerProvider.getContainerProvider()
  const categoryImageCockroachRepository = container.resolve(CategoryImageCockroachRepository)

  if (existsFetchCache[filename] !== undefined) {
    return existsFetchCache[filename]
  }

  let existsFromDatabase = await categoryImageCockroachRepository.find(filename) !== undefined;
  existsFetchCache[filename] = existsFromDatabase

  return existsFromDatabase
}

export default async function categoryToImageUrlPath(category: string, source: string) {
  const filename = category.replaceAll(' ', '-').toLowerCase()

  let categorySpecificImageUrl = `${staticAssetsBasePath}/images/categories/${filename}.jpeg`

  let imageUrl = staticAssetsBasePath + DEFAULT_IMAGE
  let exists = await filenameExists(filename);

  if (exists) {
    imageUrl = categorySpecificImageUrl
  } else {
    const metricPublisher = new CloudwatchMetricPublisher()
    metricPublisher.incrementCounter('categoryImage.notFound', 1, {source, category})
  }

  return imageUrl
}
