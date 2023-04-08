import Link from 'next/link'
import Layout from '../components/layout/Layout'
import FeaturedArticles from '../components/404/FeaturedArticles'
import {ArrowSmRightIcon} from '@heroicons/react/solid'
import Post from "../libs/interfaces/viewModels/Post";

export default function Custom404({
                                    featuredPosts,
                                  }: { featuredPosts: Post[] }) {
  return (
    <Layout metaTitle="Page not found">
      <section className="bg-gray-50">
        <div
            className="max-w-2xl min-h-screen px-4 py-12 mx-auto sm:px-6 lg:px-12 lg:max-w-screen-2xl lg:flex lg:items-center sm:pt-16 xl:py-20 ">

          {/* Page not found */}
          <div className="flex flex-col justify-center lg:w-1/2 xl:w-2/5">
            <div className="max-w-lg">
              <p className="relative text-sm tracking-widest text-red-800 uppercase">Error 404</p>
              <h2 className="mt-3 text-4xl font-medium tracking-normal text-gray-900 md:tracking-tight lg:leading-tight md:text-5xl">Page
                not found</h2>
              <div>
                <p className="mt-4 text-base leading-loose text-gray-600">
                  Sorry, the page you are looking for does not exist. Try going back or visiting a
                  different link.
                </p>
              </div>
              <div className="inline-block">
                <Link
                  href="#"
                  className="flex items-center mt-4 text-red-700 no-underline transition duration-300 ease-in-out sm:mt-5 hover:text-red-600 group">
                  Go back home<ArrowSmRightIcon
                      className="w-5 h-5 ml-2 transition duration-300 ease-in-out group-hover:text-red-700 group-hover:translate-x-1.5"/>

                </Link>
              </div>
            </div>
          </div>

          <FeaturedArticles posts={featuredPosts} />

        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  return {
    props: {
      featuredPosts: []
    }
  }
}
