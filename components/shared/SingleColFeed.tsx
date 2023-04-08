import Link from 'next/link'
import Image from "next/image";
import {formatDate} from '../../utils/formatDate'
import {CalendarIcon, ClockIcon} from '@heroicons/react/outline'
import UpVoteButton from "../buttons/UpVoteButton";
import CommentButton from "../buttons/CommentButton";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Post from "../../libs/interfaces/viewModels/Post";

export default function SingleColFeed({posts}: { posts: Post[] }) {
  return <>
    {posts.map((post, index) => (
        <article className="md:gap-8 md:grid md:grid-cols-4" key={post.id}>

          {/* Image */}
          <div className="md:col-span-1">
            <Link
              href={`${post.frontmatter.articlePageLink}`}
              className="relative z-10 block overflow-hidden rounded-2xl md:aspect-w-1 md:aspect-h-1 aspect-w-16 aspect-h-9 group bg-gray-50"
              onClick={() => {trackEvent("Article Click", {
                href: post.frontmatter.link
              })}}>

              <Image
                className="object-cover object-center transition duration-300 ease-in-out rounded-2xl group-hover:scale-110"
                src={post.frontmatter.image}
                alt={post.frontmatter.title}
                fill
                sizes="100vw" unoptimized={true}/>

            </Link>
          </div>

          {/* Content */}
          <div className="relative flex flex-col flex-wrap mt-6 md:mt-0 md:col-span-3">
            <div
                className={`box-border flex flex-col justify-between flex-1 w-full px-6 md:px-0 ${index != posts.length - 1 ? 'pb-8 mb-8 border-b-2 border-gray-100' : ''}`}>
              <div>
                {post.frontmatter.category &&
                    <Link
                      href={`/categories/${post.frontmatter.category.replace(/ /g, '-').toLowerCase()}`}
                      className="relative z-10 font-medium tracking-widest text-red-700 uppercase duration-300 ease-in-out text-tiny transition-color hover:text-red-600">

                      {post.frontmatter.category}

                    </Link>
                }

                <h3 className="mt-2.5 text-xl font-medium leading-tight text-gray-900 transition duration-300 ease-in-out lg:text-xl sm:text-2xl xl:text-2xl decoration-gray-800 decoration-2 hover:underline">
                  <Link
                    href={`${post.frontmatter.articlePageLink}`}
                    onClick={() => {trackEvent("Article Click", {
                      href: post.frontmatter.link
                    })}}>

                    {post.frontmatter.title}

                  </Link>
                </h3>
                <h4 className="text-sm font-medium leading-normal tracking-normal text-gray-500 transition duration-300 ease-in-out decoration-2 decoration-gray-800">
                  {post.frontmatter.baseLink}
                </h4>
                <p className="block mt-3.5 text-base leading-relaxed text-gray-500">
                  {post.frontmatter.description}
                </p>
              </div>

              {/* Article Footer Info */}
              <footer className="flex items-center mt-5 sm:mt-7">

                <UpVoteButton upVoteCount={post.frontmatter.upVoteCount}
                              post={post} hasVotedSSR={post.frontmatter.hasVoted}/>

                <CommentButton post={post}/>

                <div className="text-sm lg:text-[15px] flex items-center">
                  <span className="hidden text-gray-500 sm:inline-block">By&nbsp;</span>
                  <span className="relative font-medium text-gray-700">
                      {post.frontmatter.author}
                    </span>

                  <CalendarIcon className="w-[18px] h-[18px] ml-2.5 text-gray-400"/>
                  <span
                      className="ml-1 text-gray-500">{formatDate(post.frontmatter.date)}</span>
                  <span className="items-center hidden sm:flex">
                <ClockIcon className="w-[18px] h-[18px] ml-2.5 text-gray-400"/>
                <span
                    className="ml-1 text-gray-500">{post.frontmatter.time_to_read_in_minutes} min read</span>
              </span>
                </div>
              </footer>

            </div>
          </div>

        </article>
    ))}
  </>;
}
