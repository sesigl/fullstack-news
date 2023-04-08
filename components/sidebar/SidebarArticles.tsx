import Link from 'next/link'
import Image from "next/image";
import UpVoteButton from "../buttons/UpVoteButton";
import CommentButton from "../buttons/CommentButton";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Post from "../../libs/interfaces/viewModels/Post";

export default function SidebarArticles({header, posts}: { header: string, posts: Post[] }) {
  return (
    <div className="w-full p-5 bg-gray-50 sm:p-8 rounded-2xl">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">{header}</h3>

      {/* Articles */}
      <div className="pt-6 space-y-6 sm:space-y-5 lg:space-y-6 xl:space-y-5">

        {posts.map((post, index) => (
            <article key={index} className="flex space-x-4 sm:space-x-6 lg:space-x-4">

              {/* Image */}
              <Link
                href={`${post.frontmatter.articlePageLink}`}
                className="relative z-10 w-24 h-24 overflow-hidden bg-gray-100 rounded-2xl group sm:w-28 sm:h-28 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
                onClick={() => {
                  trackEvent("Article Click", {
                    href: post.frontmatter.link
                  })
                }}>

                <Image
                  className="object-cover object-center w-full h-full transition duration-300 ease-in-out rounded-2xl group-hover:scale-110"
                  src={post.frontmatter.image}
                  alt={post.frontmatter.title}
                  fill
                  sizes="100vw" unoptimized={true}/>

              </Link>

              {/* Content */}
              <div className="w-2/3">
                <div className="flex flex-col justify-center flex-1 w-full h-full">
                  <div>
                    <Link
                      href={`${post.frontmatter.articlePageLink}`}
                      className=""
                      onClick={() => {
                        trackEvent("Article Click", {
                          href: post.frontmatter.link
                        })
                      }}>

                      <h3 className="font-medium leading-snug tracking-normal text-gray-900 transition duration-300 ease-in-out text-md decoration-2 decoration-gray-800 hover:underline">{post.frontmatter.title}</h3>
                      <h4 className="font-medium leading-snug tracking-normal text-gray-500 transition duration-300 ease-in-out text-xs decoration-2 decoration-gray-800">{post.frontmatter.baseLink}</h4>

                    </Link>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between mt-2 ">

                    <UpVoteButton upVoteCount={post.frontmatter.upVoteCount}
                                  post={post} hasVotedSSR={post.frontmatter.hasVoted}/>

                    <CommentButton post={post}/>

                    {/* Author meta */}
                    <div className="flex items-center justify-center">
                      <div className="text-sm">
                        <span className="text-gray-500">By </span>
                        <span
                            className="font-medium text-gray-700">{post.frontmatter.author}</span>
                      </div>
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
