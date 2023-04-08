import Link from 'next/link'
import Image from "next/image";
import {formatDate} from '../../utils/formatDate'
import {CalendarIcon, ClockIcon} from '@heroicons/react/outline'
import UpVoteButton from "../buttons/UpVoteButton";
import CommentButton from "../buttons/CommentButton";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Post from "../../libs/interfaces/viewModels/Post";

export default function BannerArticle({post}: { post: Post }) {
  return (
    <section className="relative w-full mb-52 lg:mb-40">

      {/* Image */}
      <Link
        href={`${post.frontmatter.articlePageLink}`}
        onClick={() => {
          trackEvent("Article Click", {
            href: post.frontmatter.link
          })
        }}>

        <div className="aspect-w-5 aspect-h-2 bg-gray-50">
          <Image
            className="object-cover object-center"
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
            fill
            sizes="100vw" unoptimized={true}/>
        </div>

      </Link>

      {/* Content */}
      <div
          className="absolute inset-x-0 bottom-0 z-10 w-full max-w-3xl px-4 mx-auto translate-y-4/5 sm:translate-y-3/4 lg:translate-y-1/2 sm:px-6">
        <div
            className="flex items-center justify-center px-5 py-8 shadow-md sm:shadow-lg sm:p-10 md:p-12 bg-white/90 backdrop-blur-md lg:p-14 rounded-2xl ">
          <div className="flex flex-col items-center text-center">
            {
                post.frontmatter.category &&
                <Link
                  href={`/categories/${post.frontmatter.category.replace(/ /g, '-').toLowerCase()}`}
                  className="relative text-sm font-medium tracking-widest text-red-700 uppercase duration-300 ease-in-out transition-color hover:text-red-600">
                  {post.frontmatter.category}
                </Link>
            }
            <Link
              href={`${post.frontmatter.articlePageLink}`}
              className="block mt-3 group"
              onClick={() => {
                trackEvent("Article Click", {
                  href: post.frontmatter.link
                })
              }}>

              <h2 className="text-2xl font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out sm:text-3xl decoration-gray-800 decoration-2 sm:decoration-3 group-hover:underline md:tracking-tight lg:leading-tight lg:text-4xl">{post.frontmatter.title}</h2>
              <h3 className="text-sm font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out sm:text-3xl decoration-gray-800 decoration-2 sm:decoration-3 md:tracking-tight lg:leading-tight lg:text-sm">{post.frontmatter.baseLink}</h3>

            </Link>

            {/* Article Footer Info */}
            <footer className="flex items-center justify-between mt-5 sm:mt-7">
              <div className="flex items-center justify-center">

                <UpVoteButton upVoteCount={post.frontmatter.upVoteCount}
                              post={post} hasVotedSSR={post.frontmatter.hasVoted}/>

                <CommentButton post={post}/>


                <div className="text-sm lg:text-[15px] flex items-center">
                  <span className="hidden text-gray-500 sm:inline-block">By&nbsp;</span>
                  <span
                      className="font-medium text-gray-700">{post.frontmatter.author}</span>

                  <CalendarIcon className="w-[18px] h-[18px] ml-2.5 text-gray-400"/>
                  <span className="ml-1 text-gray-500">{formatDate(post.frontmatter.date)}</span>
                  <span className="items-center hidden sm:flex">
                  <ClockIcon className="w-[18px] h-[18px] ml-2.5 text-gray-400"/>
                  <span
                      className="ml-1 text-gray-500">{post.frontmatter.time_to_read_in_minutes} min read</span>
                </span>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </div>

    </section>
  );
}
