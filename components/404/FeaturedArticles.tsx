import Link from 'next/link'
import Image from "next/image";
import {formatDate} from '../../utils/formatDate'
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Post from "../../libs/interfaces/viewModels/Post";

export default function FeaturedArticles({
                                           posts
                                         }: { posts: Post[] }): JSX.Element {
  return (
    <div className="mt-12 sm:mt-16 lg:mt-0 lg:ml-12 lg:w-1/2 xl:w-3/5 xl:ml-16">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">Recent
        stories</h3>
      <div className="grid xl:grid-cols-2 lg:gap-x-6">
        {posts.map((post, index) => (
            <article key={index}
                     className={`py-8 lg:py-6 xl:py-8 sm:flex lg:items-center ${index > 0 ? 'border-t xl:border-t-0 border-gray-300/70' : ''}`}>

              {/* Image */}
              <Link
                href={`${post.frontmatter.articlePageLink}`}
                className="order-2 w-full sm:w-2/5 lg:w-24 xl:w-1/3 lg:order-1"
                onClick={() => {trackEvent("Article Click", {
                  href: post.frontmatter.link
                })}}>

                <div
                    className="relative z-10 overflow-hidden bg-gray-100 rounded-2xl aspect-w-16 aspect-h-9 lg:aspect-w-1 lg:aspect-h-1 group">
                  <Image
                    className="object-cover object-center transition duration-300 ease-in-out rounded-2xl group-hover:scale-110"
                    src={post.frontmatter.image}
                    alt={post.frontmatter.title}
                    fill
                    sizes="100vw" unoptimized={true} />
                </div>

              </Link>

              {/* Content */}
              <div
                  className="order-1 w-full px-2 mt-5 sm:max-w-sm sm:px-0 sm:mt-0 lg:ml-4 lg:flex-1 lg:order-2 sm:mr-4 lg:mr-0">
                  {post.frontmatter.category &&
                      <Link
                        href={`/categories/${post.frontmatter.category.replace(/ /g, '-').toLowerCase()}`}
                        className="text-xs font-medium tracking-widest text-red-700 uppercase duration-300 ease-in-out lg:hidden transition-color hover:text-red-600 2xl:block">

                        {post.frontmatter.category}

                      </Link>
                  }

                <Link
                  href={`/posts/${post.frontmatter.articlePageLink}`}
                  onClick={() => {trackEvent("Article Click", {
                    href: post.frontmatter.link
                  })}}>

                  <h3 className="mt-2 text-lg font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out xl:leading-normal hover:underline decoration-2 decoration-gray-800 lg:text-md xl:text-lg">
                    {post.frontmatter.title}
                  </h3>

                </Link>

                {/* Author */}
                <div className="flex items-center justify-between mt-4 lg:mt-3">

                  {/* Author meta */}
                  <div className="flex items-center justify-center">

                    <div className="text-sm">
                      <span className="text-gray-500">By </span>
                      <span
                          className="font-medium text-gray-700">{post.frontmatter.author}</span>
                      <span
                          className="text-gray-500 lg:hidden"> · {formatDate(post.frontmatter.date)}</span>
                    </div>
                  </div>

                </div>
              </div>

            </article>
        ))}

      </div>
    </div>
  );
}
