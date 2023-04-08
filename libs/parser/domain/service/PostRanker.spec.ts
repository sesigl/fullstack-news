import PostRanker from "./PostRanker";

jest.useFakeTimers()
jest.setSystemTime(new Date(2022, 10, 10))

describe("PostRanker", () => {

    let postRanker: PostRanker
    let now = new Date()

    let aHourAgo = new Date();
    aHourAgo.setHours(aHourAgo.getHours() - 1)

    let halfADayAgo = new Date();
    halfADayAgo.setHours(halfADayAgo.getHours() - 12)

    beforeEach(() => {
        postRanker = new PostRanker()
    })

    describe("hotRank", () => {
        it("has a neutral rank if no votes so far and recently submitted", () => {
            const post = createPost(0, now);
            const rank = postRanker.hotRank(post)

            expect(rank).toBe(0.3535533905932738)
        })

        it("has a positive rank if no votes so far and recently submitted", () => {
            const post = createPost(1, now);
            const rank = postRanker.hotRank(post)

            expect(rank).toBe(0.7071067811865476)
        })

        it("has a positive rank if single votes and 1 hour old", () => {
            const post = createPost(1, aHourAgo);
            const rank = postRanker.hotRank(post)

            expect(rank).toBe(0.3849001794597505)
        })

        it("has a worse rank if same votes but older", () => {
            const singleVoteNowRank = postRanker.hotRank(createPost(1, now))

            let singleVoteOlderRank = postRanker.hotRank(createPost(1, aHourAgo));

            expect(singleVoteNowRank)
                .toBeGreaterThan(singleVoteOlderRank)
        })

        it("10x more votes post is getting a lower rank than a more recent post", () => {
            const singleVoteRecentlyRank = postRanker.hotRank(createPost(5, aHourAgo))

            const manyVotesButOlderRank = postRanker.hotRank(createPost(50, halfADayAgo));

            expect(singleVoteRecentlyRank)
                .toBeGreaterThan(manyVotesButOlderRank)
        })

        it("12 hour old but 1 vote post should rank lower than a new post", () => {
            const newVoteRank = postRanker.hotRank(createPost(0, now))

            const oldVoteRank = postRanker.hotRank(createPost(1, halfADayAgo));

            expect(newVoteRank).toBeGreaterThan(oldVoteRank)
        })

        it("100x more votes post is getting a higher rank than a more recent post", () => {
            let aHourAgo = now;
            aHourAgo.setHours(aHourAgo.getHours() - 1)

            const singleVoteRecentlyRank = postRanker.hotRank(createPost(5, aHourAgo))

            let manyVotesButOlderRank = postRanker.hotRank(createPost(500, halfADayAgo));

            expect(singleVoteRecentlyRank)
                .toBeLessThan(manyVotesButOlderRank)
        })
    })

    describe("hotRankPosts", () => {
        it("sorts posts", () => {


            const posts = [
                createPost(0, now),
                createPost(1, now),
                createPost(10, now),
                createPost(5, aHourAgo),
                createPost(50, aHourAgo),
                createPost(100, aHourAgo),
                createPost(50, halfADayAgo),
            ]

            const sortedPosts = posts.sort((p1, p2) => postRanker.hotRankPosts(p1, p2))

            expect(sortedPosts).toEqual([
                createPost(100, aHourAgo),
                createPost(50, aHourAgo),
                createPost(10, now),
                createPost(5, aHourAgo),
                createPost(50, halfADayAgo),
                createPost(1, now),
                createPost(0, now),
            ])
        })
    })

    function createPost(upVoteCount: number, date: Date) {
        return {
            frontmatter: {
                upVoteCount: upVoteCount,
                date: date.toISOString()
            }
        };
    }

})