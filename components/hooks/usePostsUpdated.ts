import {CommentView} from "../../libs/getPosts";
import {useEffect, useState} from "react";
import axios from "axios";
import {ArticleVote} from "../../libs/parser/domain/entity/vote/VoteRepository";
import useSWR from "swr";
import objectHash from "object-hash";
import Post from "../../libs/interfaces/viewModels/Post";

function useComments(allPostsUpdated: Post[]): CommentView[] {
  const fetcher = (url: string, articleIds: string[]) => axios.post<CommentView[]>(url, {articleId: articleIds}).then(res => res.data)

  let articleIdsUpdated = allPostsUpdated.map(p => p.id);
  const {data: comments} = useSWR(
      '/api/getComments',
      (url) => fetcher(url, articleIdsUpdated),
      {fallbackData: []})
  return comments ?? [];
}

export function useVotes(allPostsUpdated: Post[]) {
  const fetcher = (url: string, articleIds: string[]) => axios.post<ArticleVote[]>(url, {articleId: articleIds}).then(res => res.data)

  let articleIdsUpdated = allPostsUpdated.map(p => p.id);
  const {data: votes} = useSWR(
      '/api/hasVoted',
      (url) => fetcher(url, articleIdsUpdated),
      {fallbackData: []})
  return votes;
}

function usePersonalizedPosts(sort: string): Post[] {
  const fetcher = (url: string) => axios.post<Post[]>(url).then(res => res.data)

  const {data: posts} = useSWR<Post[]>(
      `/api/getPersonalizedPosts?sort=${sort}`,
      (url) => fetcher(url),
      {fallbackData: []})

  return posts ?? [];
}

export default function usePostsUpdated(allPosts: Post[], sort: string) {
  const [allPostsUpdated, setAllPostsUpdated] = useState(allPosts)

  const votes = useVotes(allPostsUpdated);
  const comments = useComments(allPostsUpdated);
  const personalizedPosts = usePersonalizedPosts(sort);

  const voteCounts = (votes || []).map(c => c.voteCount.toString())
  const commentIds = (comments || []).map(c => c.id)
  const personalizedPostIds = (personalizedPosts || []).map(p => p.id)
  const allPostsIds = (allPosts || []).map(p => p.id)

  const useEffectEqualityProps: string[] = [...voteCounts, ...commentIds, ...personalizedPostIds, ...allPostsIds]

  useEffect(() => {
    setAllPostsUpdated(() => allPosts)
    if (votes) {
      setAllPostsUpdated((allPosts) => {

        return [...allPosts.map(post => {
          const postVote = votes.find(v => v.articleId === post.id)
          if (postVote) {
            post.frontmatter.hasVoted = postVote.hasVoted
            post.frontmatter.upVoteCount = postVote.voteCount
          }
          return post
        })]
      })
    }

    if (comments) {
      setAllPostsUpdated((allPosts) => {
        allPosts.forEach((post: Post) => {
          let commentsOfPost = comments.filter(c => c.articleId === post.id);
          post.frontmatter.commentCount = commentsOfPost.length
        })
        return [...allPosts]
      })
    }
  }, [objectHash(useEffectEqualityProps)])

  return {allPostsUpdated, personalizedPosts};
}
