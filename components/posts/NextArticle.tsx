import Link from 'next/link'
import UpVoteButton from "../buttons/UpVoteButton";
import CommentButton from "../buttons/CommentButton";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Post from "../../libs/interfaces/viewModels/Post";

export default function NextArticle({post}: { post: Post }) {
  return (
    <section className="relative w-full bg-fixed bg-center bg-no-repeat bg-cover h-96"
             style={{backgroundImage: `url(${post.frontmatter.image})`}}>
      <div className="absolute inset-0 bg-gray-900/50"/>

      {/* Content */}
      <div className="absolute inset-0">
        <div className="flex flex-col items-center justify-center w-full h-full max-w-xl mx-auto">
          <span className="relative text-sm font-medium tracking-widest text-red-100 uppercase">Next article</span>

          <Link
            href={`${post.frontmatter.articlePageLink}`}
            onClick={() => {
              trackEvent("Article Click", {
                href: post.frontmatter.link
              })
            }}>

            <h2 className="mt-3 text-3xl font-medium tracking-normal text-center text-white sm:text-4xl md:tracking-tight lg:leading-tight lg:text-5xl">{post.frontmatter.title}</h2>
            <h3 className="text-sm font-light tracking-normal text-center text-white md:tracking-tight lg:leading-tight">{post.frontmatter.baseLink}</h3>

          </Link>
          <div className="flex items-center mt-4 sm:mt-8">
            <UpVoteButton upVoteCount={post.frontmatter.upVoteCount}
                          post={post}
                          hasVotedSSR={post.frontmatter.hasVoted}
                          color="white"/>

                <CommentButton post={post} color="white"/>
            </div>
        </div>

      </div>

    </section>
  );
}
