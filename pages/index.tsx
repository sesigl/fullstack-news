import Layout from '../components/layout/Layout'
import Newsletter, {NewsletterProps} from '../components/shared/Newsletter'
import {getAllPostsIsr} from '../libs/getPosts'
import {CategoryViewModel, getCategories} from '../libs/getCategories'
import {getTags} from '../libs/getTags'
import {getContentPage} from '../libs/getContentPage'
import {GetStaticPropsContext} from "next";
import SortMode from "../libs/interfaces/SortMode";
import PostFetchInformation from "../components/home/PostFetchInformation";
import usePostsUpdated from "../components/hooks/usePostsUpdated";
import ArticleList from "../components/home/ArticleList";
import Post from "../libs/interfaces/viewModels/Post";

export default function Home({
                               allPosts,
                               categories,
                               newsletter,
                               sort,
                             }: {
  allPosts: Post[],
  categories: CategoryViewModel[],
  tags: string[],
  newsletter: NewsletterProps,
  sort: string
}) {
  let {allPostsUpdated, personalizedPosts} = usePostsUpdated(allPosts, sort);

  let personalizedPostsIds = personalizedPosts.map(p => p.id)

  allPostsUpdated = allPostsUpdated.filter(p => !personalizedPostsIds.includes(p.id))
  allPostsUpdated = [...personalizedPosts, ...allPostsUpdated]

  let postsWithChallenge = allPostsUpdated.filter(p => p.frontmatter.challenges.length > 0)

  return (
      <Layout>

        <PostFetchInformation personalized={personalizedPosts.length > 0}/>

        <ArticleList allPostsUpdated={allPostsUpdated} categories={categories} postsWithChallenge={postsWithChallenge}/>

        <Newsletter newsletter={newsletter}/>
      </Layout>
  )
}

export async function getStaticProps(context: GetStaticPropsContext) {
  let sort = context.params?.sort as string;
  let allPosts = await getAllPostsIsr(sort);

  let categories = await getCategories(allPosts);
  let tags = getTags(allPosts);
  return {
    props: {
      allPosts: allPosts,
      sort: sort ?? SortMode.HOT,
      categories: categories.slice(0, 6),
      tags: tags,
      newsletter: getContentPage('content/shared/newsletter.md')
    },
    revalidate: 1200, // In seconds
  }
}
