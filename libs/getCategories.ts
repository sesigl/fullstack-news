import uniqueUnionSorted from "./parser/infrastructure/js/array/uniqueUnionSorted";
import categoryToImageUrlPath from "./parser/infrastructure/category/categoryToImageUrlPath";
import Post from "./interfaces/viewModels/Post";

export interface CategoryViewModel {
  frontmatter: { name: string, image: string };
  slug: string
}

export async function getCategories(posts: Post[]): Promise<CategoryViewModel[]> {

  let tags = posts.flatMap((article) => {
    return article.frontmatter.tags
  });

  let sortedTagsByCount = uniqueUnionSorted(tags)

  const uniqueTags = Array.from(new Set(sortedTagsByCount))
  .filter(t => t.trim() !== "")

  return Promise.all(uniqueTags.map(async (tag) => {
    return ({
      slug: tag,
      frontmatter: {
        name: tag,
        slug: tag.replace(/ /g, '-').toLowerCase(),
        image: await categoryToImageUrlPath(tag, 'getCategories')
      },
    })
  }))
}

