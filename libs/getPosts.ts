import {sortByDate} from "../utils/sort"
import GetArticlesApplicationServices from "./parser/application/GetArticlesApplicationServices";
import ContainerProvider from "./parser/infrastructure/dependencyInjection/ContainerProvider";
import {GetServerSidePropsContext, GetStaticPropsContext} from "next";
import getArticlePageLink from "./parser/domain/entity/article/functions/getArticlePageLink";
import getBaseUrlFromUrl from "./parser/domain/entity/article/functions/getBaseUrlFromUrl";
import PostRanker from "./parser/domain/service/PostRanker";
import SortMode from "./interfaces/SortMode";
import ArticleWithRelations from "./parser/domain/entity/article/ArticleWithRelations";
import {toChallengeViewModel} from "./interfaces/viewModels/ChallengeViewModel";
import Post from "./interfaces/viewModels/Post";

let container = ContainerProvider.getContainerProvider();

export interface CommentView {
  readonly articleId: string
  readonly createdAt: string,
  readonly message: string
  readonly id: string,
  user: {
    id: string,
    displayName: string
  } | null
}

const postRanker = new PostRanker()

export async function articleToPost(article: ArticleWithRelations, userId: string | undefined): Promise<Post> {

  function beautifyContent(content: string) {
    let replaceSquareBrackedLinkContent = content.replaceAll(/\[(.*?)]/gm, "");

    const lastDotIndex = replaceSquareBrackedLinkContent.lastIndexOf(".")

    return replaceSquareBrackedLinkContent.slice(0, lastDotIndex + 1);
  }

  return {
    id: article.id,
    slug: article.id,
    frontmatter: {
      articlePageLink: getArticlePageLink(article),
      image: article.imageLink,
      title: article.title,
      description: beautifyContent(article.description),
      time_to_read_in_minutes: 10,
      date: article.parsedAt.toISOString(),
      author: article.author,
      category: article.tags.find(t => t.trim() !== "") ?? null,
      tags: article.tags,
      group: "Regular",
      views: 0,
      link: article.link,
      baseLink: getBaseUrlFromUrl(article.link),
      upVoteCount: article.votes.length,
      commentCount: article.comments.length,
      comments: article.comments.map(c => ({
        id: c.id,
        articleId: c.articleId,
        message: c.message,
        createdAt: c.createdAt.toISOString(),
        user: c.user ? ({id: c.user.id, displayName: c.user.displayName}) : null
      })),
      hasVoted: article.votes.some(v => v.visitorId === userId),
      challenges: article.challenges.map(toChallengeViewModel)
    },
    content: article.description,
  };
}

export async function getSortedPostsForArticles(articles: ArticleWithRelations[], sort: string, userId: string | undefined) {
  let posts = await Promise.all(articles.map(a => (articleToPost(a, userId))));

  const sortMode = sort ? sort as SortMode : SortMode.HOT

  switch (sortMode) {
    case SortMode.HOT:
      return sortHotRank(posts)
    case SortMode.NEW:
      return sortByParseDate(posts)
    case SortMode.TOP:
      return sortByUpVoteCount(posts)
  }
}

export async function getSortedPosts(sort: string): Promise<Post[]> {

  let getArticlesApplicationServices = container.resolve(GetArticlesApplicationServices);

  const articles = await getArticlesApplicationServices.getAllArticlesWithRelations()

  return await getSortedPostsForArticles(articles, sort, undefined);

}

function sortHotRank(posts: Awaited<Post>[]) {
  return posts.sort((p1, p2) => postRanker.hotRankPosts(p1, p2));
}

function sortByParseDate(posts: Awaited<Post>[]) {
  return posts.sort((p1, p2) => new Date(p2.frontmatter.date).getTime() - new Date(p1.frontmatter.date).getTime());
}

function sortByUpVoteCount(posts: Awaited<Post>[]) {
  return posts.sort((p1, p2) => {
    let diff = p2.frontmatter.upVoteCount - p1.frontmatter.upVoteCount;

    if (diff === 0) {
      diff = new Date(p2.frontmatter.date).getTime() - new Date(p1.frontmatter.date).getTime()
    }

    return diff
  });
}

export async function getAllPostsIsr(sort: string): Promise<Post[]> {
  return await getSortedPosts(sort)
}

export async function getPostsInCategory(category: string, context: GetStaticPropsContext) {
  const posts = await getSortedPosts(context.params?.sort as string)

  return posts.filter((post) => {
    return post.frontmatter.tags.map(t => t.toLowerCase()).indexOf(category) !== -1
  })
}

export async function getPostsFromAuthor(context: GetServerSidePropsContext, author: string) {
  const posts = await getSortedPosts(context.params?.sort as string)

  const postsFromAuthor = posts.filter((post) => {
    return post.frontmatter.author == author
  })

  return postsFromAuthor.sort(sortByDate)
}

export async function getNextArticle(sort: string) {
  const posts = await getSortedPosts(sort)

  // if (postsInSameCategory.length > 0) {
  //   /* Return random post in same category */
  //   return postsInSameCategory[Math.floor(Math.random() * postsInSameCategory.length)]
  // } else {
  /* Return random post */
  return posts[Math.floor(Math.random() * posts.length)]
  // }
  // return undefined;
}

export async function getPostsWithTag(context: GetServerSidePropsContext, tagSlug: string) {
  const posts = await getSortedPosts(context.params?.sort as string)

  return posts.filter((post) => {
    return post.frontmatter.tags.some((tag: string) => {
      return tag.toLowerCase().replace(/ /g, '-') === tagSlug
    })
  })
}
