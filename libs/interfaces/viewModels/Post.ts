import ChallengeViewModel from "./ChallengeViewModel";
import {CommentView} from "../../getPosts";

export default interface Post {
  slug?: string;
  id: string;
  frontmatter: {
    articlePageLink: string,
    image: string,
    title: string,
    description: string,
    category: string | null,
    tags: string[],
    author: string,
    upVoteCount: number,
    commentCount: number,
    comments: CommentView[],
    challenges: ChallengeViewModel[],
    hasVoted: boolean,
    date: string,
    views: number,
    link: string,
    baseLink: string,
    time_to_read_in_minutes: number,
    group: "Archived" | "Featured" | "Regular"
  };
  content: string;
}
