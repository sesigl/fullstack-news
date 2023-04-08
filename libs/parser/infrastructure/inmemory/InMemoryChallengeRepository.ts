import ChallengeRepository from "../../domain/challenge/ChallengeRepository";
import Challenge from "../../domain/challenge/Challenge";
import ProgrammingLanugage from "../../domain/challenge/ProgrammingLanugage";

export default class InMemoryChallengeRepository implements ChallengeRepository {

  dummyChallenges: Challenge[] = [
    new Challenge("1",
        "Example Challenge", "Example description", "Example goal",
        ProgrammingLanugage.JAVASCRIPT,

        `describe("Your coding task name", () => {
 
  it("your first test case", () => {
    expect(solution()).toBe(true);
  });
 
 });`,

        `
function solution(parameter) {
  return true;
}`,

        `function solution(parameter) {
  // your code goes here
}`,
        "creatorUserId", true, ["2a9defc4-2991-4269-afd4-0f59f14ab5c2"]),

    new Challenge("2",
        "Example not approved Challenge", "Example description", "Example goal",
        ProgrammingLanugage.TYPESCRIPT,

        `describe("Your coding task name", () => {
 
  it("your first test case", () => {
    expect(solution()).toBe(true);
  });
 
 });`,

        `
function solution(parameter): boolean {
  return true;
}`,

        `function solution(parameter): boolean {
  // your code goes here
}`,

        "creatorUserId", false, ["2a9defc4-2991-4269-afd4-0f59f14ab5c2"])
  ]

  findAll(): Promise<Challenge[]> {
    return Promise.resolve([...this.dummyChallenges]);
  }

  findAllByUserId(userId: string): Promise<Challenge[]> {
    return Promise.resolve([...this.dummyChallenges]);
  }

  async findById(challengeId: string): Promise<Challenge | null> {
    return this.dummyChallenges.find(c => c.id === challengeId) ?? null
  }

  upsertChallenge(challenge: Challenge): Promise<Challenge> {

    const existingChallenge = this.dummyChallenges.find(c => c.id === challenge.id)

    if (existingChallenge) {
      this.dummyChallenges = this.dummyChallenges.filter(c => c.id !== existingChallenge.id)
    }

    console.info('upsert: ', challenge)

    this.dummyChallenges.push(challenge)

    return Promise.resolve(challenge);
  }

  findAllByArticleIds(articleIds: string[]): Challenge[] {
    return this.dummyChallenges.filter(c => {
      let isIncluded = false

      for (const challengeArticleId of c.articleIds) {
        if (articleIds.includes(challengeArticleId)) {
          isIncluded = true
          break;
        }
      }

      return isIncluded
    })
  }
}
