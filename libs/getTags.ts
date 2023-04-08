import uniqueUnionSorted from "./parser/infrastructure/js/array/uniqueUnionSorted";
import Post from "./interfaces/viewModels/Post";

export function getTags(posts: Post[]): string[] {
  let tags = posts.flatMap((post) => {
    return post.frontmatter.tags
  }).filter(tag => tag.trim() !== "");

  let sortedTagsByCount = uniqueUnionSorted(tags)

  return Array.from(new Set(sortedTagsByCount))
}
