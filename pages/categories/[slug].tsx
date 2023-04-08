import Layout from '../../components/layout/Layout'
import Newsletter, {NewsletterProps} from '../../components/shared/Newsletter'
import CategoryHeader from '../../components/headers/CategoryHeader'
import SingleColFeed from '../../components/shared/SingleColFeed'
import SidebarAd from '../../components/sidebar/SidebarAd'
import SidebarSocialLinks from '../../components/sidebar/SidebarSocialLinks'
import BannerArticle from '../../components/shared/BannerArticle'
import Pagination from '../../components/shared/Pagination'
import {getContentPage} from '../../libs/getContentPage'
import {getAllPostsIsr, getPostsInCategory} from '../../libs/getPosts'
import {Author} from '../../libs/getAuthors'
import {Category} from "../../components/home/Topics";
import categoryToImageUrlPath
  from "../../libs/parser/infrastructure/category/categoryToImageUrlPath";
import {GetStaticPropsContext} from "next";
import {getCategories} from "../../libs/getCategories";
import SortMode from "../../libs/interfaces/SortMode";
import Post from "../../libs/interfaces/viewModels/Post";

export default function CategoryPage({
                                       frontmatter: category,
                                       newsletter,
                                       posts,
                                     }: {
  slug: string,
  frontmatter: Category,
  authors: Author[],
  newsletter: NewsletterProps,
  posts: Post[],
  popularPosts: Post[]
}) {
  return (
      <Layout metaTitle={`Showing posts in ${category.name}`}>
        <CategoryHeader category={category}/>

        {/* Feed with Sidebar */}
        <section
            className="relative max-w-xl px-4 py-12 mx-auto lg:max-w-screen-xl sm:py-16 lg:py-24 sm:px-12 md:max-w-3xl lg:px-8">
          <div className="w-full lg:grid lg:gap-8 xl:gap-12 lg:grid-cols-3">

            <div className="col-span-2">
              <SingleColFeed posts={posts.slice(0, 6)}/>
            </div>

            {/* Sidebar */}
            <div className="w-full mt-12 space-y-8 sm:mt-16 lg:mt-0 lg:col-span-1">
              {/*
                <SidebarArticles posts={popularPosts} header={`Most read in ${category.name}`}/>
                */}
              <SidebarSocialLinks/>
              <SidebarAd/>
            </div>

          </div>
        </section>

        {posts.length >= 8 && (
            <>
              <BannerArticle post={posts[6]}/>

              <section
                  className="relative max-w-xl px-5 py-12 mx-auto lg:max-w-4xl sm:py-16 lg:py-24 md:max-w-3xl lg:px-8">

                {/* Articles */}
                <div className="pb-8 mb-6 border-b-2 border-gray-100 sm:pb-10 sm:mb-10">
                  <SingleColFeed posts={posts.slice(7, 13)}/>
                </div>

                <Pagination/>

              </section>
            </>
        )}


        <Newsletter newsletter={newsletter}/>
      </Layout>
  )
}

export async function getStaticPaths() {

  // let allPosts = await getAllPostsIsr(SortMode.HOT);
  // let categories = await getCategories(allPosts);
  // const paths = categories.map(category => ({
  //   params: {slug: category.slug}
  // }))

  return {
    paths: [], //paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps(context: GetStaticPropsContext) {

  let slug = context.params?.slug as string;

  return {
    props: {
      slug,
      frontmatter: {
        name: slug,
        image: await categoryToImageUrlPath(slug, 'categories.slug.getStaticProps')
      },
      newsletter: getContentPage('content/shared/newsletter.md'),
      posts: await getPostsInCategory(slug, context)
    },
    revalidate: 1200, // In seconds
  };
}
