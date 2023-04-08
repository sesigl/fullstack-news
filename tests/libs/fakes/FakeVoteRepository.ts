import VoteRepository, {ArticleVote} from "../../../libs/parser/domain/entity/vote/VoteRepository";
import Vote from "../../../libs/parser/domain/entity/vote/Vote";

export default class FakeVoteRepository implements VoteRepository {

  votes: Vote[] = []

  addVote(vote: Vote): Promise<Vote> {
    this.votes.push(vote)
    return Promise.resolve(vote);
  }

  getVoteCountFor(articleId: string): Promise<number> {
    const matchingVotes = this.votes.filter(v => v.articleId === articleId)
    return Promise.resolve(matchingVotes.length);
  }

  hasVote(articleIds: string[], visitorId: string): Promise<ArticleVote[]> {
    const result = articleIds.map(articleId => {
      const matchingVotes = this.votes.find(v => v.articleId === articleId && v.visitorId === visitorId)
      const voteCount = this.votes.filter(v => v.articleId === articleId).length
      return {articleId: articleId, hasVoted: !!matchingVotes, voteCount: voteCount}
    })

    return Promise.resolve(result)
  }

  removeVote(articleId: string, visitorId: string): Promise<void> {
    this.votes = this.votes.filter(v => !(v.articleId === articleId && v.visitorId === visitorId))
    return Promise.resolve(undefined);
  }


}