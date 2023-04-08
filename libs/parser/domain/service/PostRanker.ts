interface PartialPost {
    frontmatter: { upVoteCount: number, date: string }
}
export default class PostRanker {
    private getHoursDiff(startDate: Date, endDate: Date) {
        const msInHour = 1000 * 60 * 60;

        return Math.round(Math.abs(endDate.getTime() - startDate.getTime()) / msInHour);
    }

    hotRank(post: PartialPost) {

        const postDate = new Date(post.frontmatter.date)
        const currentDate = new Date()
        const ageInHours = this.getHoursDiff(postDate, currentDate)

        return (post.frontmatter.upVoteCount + 1) / Math.pow(ageInHours + 2, 1.5)
    }

    hotRankPosts(p1: PartialPost, p2: PartialPost) {
        let hotRankDiff = this.hotRank(p2) - this.hotRank(p1);

        if (hotRankDiff === 0) {
            hotRankDiff = new Date(p2.frontmatter.date).getTime() - new Date(p1.frontmatter.date).getTime()
        }

        return hotRankDiff
    }
}