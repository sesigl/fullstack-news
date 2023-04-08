import Link from 'next/link'
import Image from "next/image";
import {CalendarIcon, ClockIcon} from '@heroicons/react/outline'
import {marked} from 'marked'
import {formatDate} from '../../utils/formatDate'
import {getSocialIconComponent} from '../../utils/getSocialIconComponent'
import siteConfig from '../../config/site.config';
import {Author} from "../../libs/getAuthors";
import {CommentView} from '../../libs/getPosts'
import UpVoteButton from "../buttons/UpVoteButton";
import CommentEditor from "../comment-editor/CommentEditor";
import CommentSection from '../comment-section/CommentSection'
import axios from "axios";
import useSWR from "swr";
import CommentButton from "../buttons/CommentButton";
import {useVotes} from "../hooks/usePostsUpdated";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import TypeScriptSvg from "../challenges/programming-language-icons/TypeScriptSvg";
import JavaScriptSvg from "../challenges/programming-language-icons/JavaScriptSvg";
import {ReactNode, useState} from "react";
import CodeSolutionEditor from "./CodeSolutionEditor";
import {useUser} from "@auth0/nextjs-auth0";
import {useRouter} from "next/router";
import Post from "../../libs/interfaces/viewModels/Post";

export interface PostProps {
  slug: string,
  image: string,
  title: string,
  category: string,
  description: string,
  author: string,
  date: Date,
  time_to_read_in_minutes: string,
  tags: string[]
}

export default function PostCmp({
                               post,
                               authors,
                             }: { post: Post, authors: Author[] }) {

  const [codeEditor, setCodeEditor] = useState<ReactNode>(<></>)
  const router = useRouter()
  let pageUrl = `${siteConfig.baseURL.replace(/\/$|$/, '/')}posts/${post.slug}`

  const fetcher = (url: string) => axios.get<CommentView[]>(url).then(res => res.data)

  const {data: comments, mutate} = useSWR(
      '/api/getComments?articleId=' + post.id,
      fetcher,
      {fallbackData: post.frontmatter.comments})

  const votes = useVotes([post]);

  if (votes && votes[0]) {
    post.frontmatter.upVoteCount = votes[0].voteCount
    post.frontmatter.hasVoted = votes[0].hasVoted
  }
  const userContext = useUser()

  return (
    <article className="pb-12 sm:pb-16 lg:pb-24 bg-gray-50">

      {/* Post Header */}
      <header>

        {/* Image */}
        <div className="w-full bg-gray-100 aspect-w-3 aspect-h-2 sm:aspect-h-1">
          <Image
            className="object-cover object-center"
            src={post.frontmatter.image}
            alt={post.frontmatter.title}
            fill
            sizes="100vw" unoptimized={true}/>
        </div>

        {/* Post Header Content */}
        <div className="px-5 lg:px-0">

          {/* Article Information */}
          <div
              className="pt-10 pb-8 mx-auto mb-8 text-lg border-b max-w-prose border-gray-300/70 sm:pt-16">
            {
                post.frontmatter.category &&
                <Link
                  href={`/categories/${post.frontmatter.category.replace(/ /g, '-').toLowerCase()}`}
                  className="relative text-sm font-medium tracking-widest text-red-700 uppercase duration-300 ease-in-out transition-color hover:text-red-600">
                  {post.frontmatter.category}
                </Link>
            }
            <Link
              href={post.frontmatter.articlePageLink}
              onClick={() => {trackEvent("Article Click", {
                href: post.frontmatter.link
              })}}>

              <h2 id="headline"
                  className="mt-3.5 text-4xl font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out sm:mt-5 decoration-black-300 decoration-3 hover:underline md:tracking-tight sm:leading-tight sm:text-5xl lg:text-6xl">{post.frontmatter.title}
              </h2>
              <h2 id="fromWebsite"
                  className="text-sm font-medium tracking-normal text-gray-500 transition duration-300 ease-in-out decoration-red-300 decoration-3 md:tracking-tight sm:leading-tight text-sm">{post.frontmatter.baseLink}
              </h2>

            </Link>
            <div>
              <p className="mt-4 text-base leading-loose text-gray-600">
                {post.frontmatter.description}
              </p>
            </div>

            <div className="mt-4">
              <Link href={post.frontmatter.link} target="_blank">
              <button
                  className="text-white py-1.5 px-4 rounded bg-red-700 hover:bg-red-800 flex">

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>

                Read Full Article
              </button>
              </Link>
            </div>


            {/* Author meta */}
            <div className="flex items-center mt-6 sm:mt-8">

              <UpVoteButton post={post}
                            upVoteCount={post.frontmatter.upVoteCount}
                            hasVotedSSR={post.frontmatter.hasVoted}/>

              <CommentButton post={post}/>

              <div className="text-sm lg:text-[15px] flex items-center">
                <span className="hidden text-gray-500 sm:inline-block">By&nbsp;</span>
                <span className="font-medium text-gray-700">
                    {post.frontmatter.author}
                  </span>
                <CalendarIcon className="w-[18px] h-[18px] ml-4 text-gray-400"/>
                <span className="ml-1 text-gray-500">{formatDate(post.frontmatter.date)}</span>
                <span className="items-center hidden sm:flex">
                <ClockIcon className="w-[18px] h-[18px] ml-3 text-gray-400"/>
                <span
                    className="ml-1 text-gray-500">{post.frontmatter.time_to_read_in_minutes} min read</span>
              </span>
              </div>
            </div>

            {/*<div className="flex items-center mt-6 sm:mt-8">
              <ul className="flex flex-wrap justify-start">
                {post.frontmatter.tags.filter(tag => tag.trim() !== "").map((tag) => (
                    <li key={tag}>
                      <Link href={`/tags/${tag.replace(/ /g, '-').toLowerCase()}`}>
                        <a>
                  <span
                      className="inline-flex items-center px-4 py-1 m-1 text-sm font-medium text-gray-800 transition duration-300 ease-in-out bg-transparent border rounded-full sm:px-6 sm:py-2 border-gray-300/70 hover:text-red-700">
                    {tag}
                  </span>
                        </a>
                      </Link>
                    </li>
                ))}
              </ul>
            </div>*/}
          </div>


        </div>

      </header>

      <div className="px-5 lg:px-0">

        <div
            className="mx-auto prose sm:prose-lg hover:prose-a:text-red-700 prose-a:duration-300 prose-a:ease-in-out prose-a:transition prose-img:rounded-xl">

          <h3 id="challenges"
              className="mt-3.5 text-4xl font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out sm:mt-5 decoration-red-300 decoration-3 group-hover:underline md:tracking-tight sm:leading-tight sm:text-3xl lg:text-4xl">Coding Challenges
          </h3>

          <div className="flex flex-col gap-2">
          { post.frontmatter.challenges.map(challenge => (
              <div key={challenge.id}
                   className="shadow-md hover:shadow-xl transition-all rounded-xl border-gray-200 border-t border-gray-300/70 m-2 p-4 relative cursor-pointer "
                   onClick={() => { userContext.user &&
                     setCodeEditor(<CodeSolutionEditor challenge={challenge} onClose={() => {
                       setCodeEditor(<></>)
                     }}/>)
                   }}>
                {!userContext.user &&
                    <Link href={"/api/auth/login?returnTo=" + router.asPath}>
                      <div
                          className="z-50 group bg-black transition-all rounded-xl bg-opacity-0 hover:bg-opacity-25 h-full w-full absolute top-0 left-0 flex items-center align-middle">
                        <div
                            className="text-red-700 font-bold m-auto transition-all opacity-0 group-hover:opacity-100">Click
                          to Login
                        </div>
                      </div>
                    </Link>
                }
                <div className="flex align-middle flex-row relative">
                  <div>
                    {challenge.language === "typescript" ?
                        <TypeScriptSvg/>
                        : <JavaScriptSvg/>
                    }
                  </div>
                  <span className="text-lg font-medium leading-6 text-gray-900 ml-2 mt-0.5">
                    {challenge.name}
                  </span>
                </div>

                <div className="mt-2">
                  {challenge.description}
                </div>

                <div className="flex flex-row absolute right-4 absolute right-2 top-1/2 -mt-5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-9 h-9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                </div>
              </div>
          ))}

            {post.frontmatter.challenges.length === 0 &&
                <Link href={`/challenge/create?articleId=${post.id}`} className={`no-underline`}>
                  <div className="shadow-md hover:shadow-xl transition-all rounded-xl border-gray-200 border-t border-gray-300/70 m-2 p-4 relative cursor-pointer">
                    No coding task available, click here to create one.
                  </div>
                </Link>
            }

          </div>

        </div>

        <div
            className="mx-auto prose sm:prose-lg hover:prose-a:text-red-700 prose-a:duration-300 prose-a:ease-in-out prose-a:transition prose-img:rounded-xl">

          <h3 id="comments"
              className="mt-3.5 text-4xl font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out sm:mt-5 decoration-red-300 decoration-3 group-hover:underline md:tracking-tight sm:leading-tight sm:text-3xl lg:text-4xl">Comments
          </h3>

          <CommentEditor postId={post.id} postLink={post.frontmatter.link} onAfterNewComment={() => {
            mutate()
          }}/>
          <CommentSection post={post} comments={comments || []}/>
        </div>

        {/* Post Footer */}
        <footer
            className="mx-auto mt-12 text-lg divide-y sm:mt-14 max-w-prose divide-y-gray-300/70">


          {/* Social Share Buttons */}
          <div className="py-8 sm:py-10">
            <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">
              Share
            </span>

              {/* Social Links */}
              <ul className="flex items-center space-x-3">

                {/* Twitter */}
                <li>
                  <a
                      href={`https://twitter.com/intent/tweet?text=${post.frontmatter.title}&url=${pageUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 transition duration-300 ease-in-out bg-transparent border rounded-full border-gray-300/70 sm:w-12 sm:h-12 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="w-4 h-4 text-gray-700 transition duration-300 ease-in-out transform group-hover:text-red-700 group-hover:scale-110"
                         viewBox="0 0 512 512" fill="currentColor">
                      <path
                          d="M496 109.5a201.8 201.8 0 01-56.55 15.3 97.51 97.51 0 0043.33-53.6 197.74 197.74 0 01-62.56 23.5A99.14 99.14 0 00348.31 64c-54.42 0-98.46 43.4-98.46 96.9a93.21 93.21 0 002.54 22.1 280.7 280.7 0 01-203-101.3A95.69 95.69 0 0036 130.4c0 33.6 17.53 63.3 44 80.7A97.5 97.5 0 0135.22 199v1.2c0 47 34 86.1 79 95a100.76 100.76 0 01-25.94 3.4 94.38 94.38 0 01-18.51-1.8c12.51 38.5 48.92 66.5 92.05 67.3A199.59 199.59 0 0139.5 405.6a203 203 0 01-23.5-1.4A278.68 278.68 0 00166.74 448c181.36 0 280.44-147.7 280.44-275.8 0-4.2-.11-8.4-.31-12.5A198.48 198.48 0 00496 109.5z"/>
                    </svg>
                  </a>
                </li>

                {/* Facebook */}
                <li>
                  <a
                      href={`https://www.facebook.com/sharer.php?u=${pageUrl}&quote=${post.frontmatter.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 transition duration-300 ease-in-out bg-transparent border rounded-full border-gray-300/70 sm:w-12 sm:h-12 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="w-4 h-4 text-gray-700 transition duration-300 ease-in-out transform group-hover:text-red-700 group-hover:scale-110"
                         viewBox="0 0 512 512" fill="currentColor">
                      <path xmlns="http://www.w3.org/2000/svg"
                            d="M480 257.35c0-123.7-100.3-224-224-224s-224 100.3-224 224c0 111.8 81.9 204.47 189 221.29V322.12h-56.89v-64.77H221V208c0-56.13 33.45-87.16 84.61-87.16 24.51 0 50.15 4.38 50.15 4.38v55.13H327.5c-27.81 0-36.51 17.26-36.51 35v42h62.12l-9.92 64.77H291v156.54c107.1-16.81 189-109.48 189-221.31z"
                            fillRule="evenodd"/>
                    </svg>
                  </a>
                </li>

                {/* Linkedin */}
                <li>
                  <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 transition duration-300 ease-in-out bg-transparent border rounded-full border-gray-300/70 sm:w-12 sm:h-12 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg"
                         className="w-4 h-4 text-gray-700 transition duration-300 ease-in-out transform group-hover:text-red-700 group-hover:scale-110"
                         viewBox="0 0 512 512" fill="currentColor">
                      <path xmlns="http://www.w3.org/2000/svg"
                            d="M444.17 32H70.28C49.85 32 32 46.7 32 66.89v374.72C32 461.91 49.85 480 70.28 480h373.78c20.54 0 35.94-18.21 35.94-38.39V66.89C480.12 46.7 464.6 32 444.17 32zm-273.3 373.43h-64.18V205.88h64.18zM141 175.54h-.46c-20.54 0-33.84-15.29-33.84-34.43 0-19.49 13.65-34.42 34.65-34.42s33.85 14.82 34.31 34.42c-.01 19.14-13.31 34.43-34.66 34.43zm264.43 229.89h-64.18V296.32c0-26.14-9.34-44-32.56-44-17.74 0-28.24 12-32.91 23.69-1.75 4.2-2.22 9.92-2.22 15.76v113.66h-64.18V205.88h64.18v27.77c9.34-13.3 23.93-32.44 57.88-32.44 42.13 0 74 27.77 74 87.64z"/>
                    </svg>
                  </a>
                </li>

              </ul>

            </div>
          </div>

          {/* Author Details */}
          {authors.map((author) =>
                  post.frontmatter.author === author.frontmatter.name && (
                      <div key={author.frontmatter.name} className="py-8 sm:py-10">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col sm:flex-row">

                            {/* Content */}
                            <div className="mt-5 text-left sm:mt-0 sm:ml-6">
                              <div className="flex items-center justify-between">
                                <div className="'flex flex-col">
                                  <p className="text-xs tracking-widest text-red-600 uppercase">
                                    {author.frontmatter.role}
                                  </p>
                                  <h1 className="mt-1 text-xl font-medium tracking-normal text-gray-900 md:tracking-tight lg:leading-tight">
                                    {author.frontmatter.name}
                                  </h1>
                                </div>
                              </div>
                              <div className="mt-2.5 text-base leading-loose text-gray-500"
                                   dangerouslySetInnerHTML={{__html: marked.parse(author.bio)}}>
                              </div>

                              {/* Author Social Links */}
                              <ul className="flex items-center mt-3.5 space-x-3">

                                {author.frontmatter.social_links.map((socialLink: { name: string, url: string }) => (
                                    <li key={socialLink.name}>
                                      <a href={socialLink.url} className="group">
                                        {getSocialIconComponent({
                                          name: socialLink.name,
                                          props: {
                                            className: "w-5 h-5 text-gray-400 transition duration-300 ease-in-out group-hover:text-gray-600"
                                          }
                                        })}
                                      </a>
                                    </li>
                                ))}

                              </ul>

                            </div>

                          </div>
                        </div>
                      </div>
                  )
          )}

        </footer>

      </div>
      {codeEditor}
    </article>
  );
}
