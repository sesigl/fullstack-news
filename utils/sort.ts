import Post from "../libs/interfaces/viewModels/Post";

export const sortByDate = (a: Post, b: Post): number => {
  return new Date(b.frontmatter.date).getDate() - new Date(a.frontmatter.date).getDate()
}

export const sortByViews = (a: Post, b: Post) => {
  return b.frontmatter.views - a.frontmatter.views
}
