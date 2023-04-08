import Vote from "../vote/Vote";

export interface ArticleVote {
  articleId: string,
  hasVoted: boolean,
  voteCount: number
}

export default interface VoteRepository {

  addVote(vote: Vote): Promise<Vote>

  removeVote(articleId: string, visitorId: string): Promise<void>

  hasVote(articleId: string[], visitorId: string): Promise<ArticleVote[]>;

  getVoteCountFor(articleId: string): Promise<number>;
}