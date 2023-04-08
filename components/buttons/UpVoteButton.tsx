import {useEffect, useState} from "react";
import axios from "axios";
import ActionButton from "./ActionButton";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";

export default function UpVoteButton({
                                         disabled,
                                         post,
                                         upVoteCount,
                                         hasVotedSSR,
                                         color = "black"
                                     }: { disabled?: boolean, color?: string, post: { id: string, frontmatter: { articlePageLink: string } }, upVoteCount: number, hasVotedSSR: boolean }) {

    const [liveVoteCount, setLiveVoteCount] = useState(upVoteCount)
    const [hasVoted, setHasVoted] = useState(hasVotedSSR)

    useEffect(() => {
        setLiveVoteCount(upVoteCount)
    }, [upVoteCount])

    useEffect(() => {
        setHasVoted(hasVotedSSR)
    }, [hasVotedSSR])

    const handleOnClick = () => {

        if (hasVoted) {
            setHasVoted(false)
            setLiveVoteCount((prevCount) => prevCount - 1)

            axios.post("/api/removeVote", {
                articleId: post.id
            }, {withCredentials: true})

            trackEvent("Remove Upvote", {articleId: post.id})
            .catch(console.error)

        } else {
            setHasVoted(true)
            setLiveVoteCount((prevCount) => prevCount + 1)

            axios.post("/api/addVote", {
                articleId: post.id
            }, {withCredentials: true})

            trackEvent("Add Upvote", {articleId: post.id})
            .catch(console.error)
        }

    }

    return (
        <ActionButton disabled={disabled}
                      svgPath={"M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"}
                      text={liveVoteCount}
                      buttonTitle={"Upvote"}
                      onButtonClick={handleOnClick}
                      active={hasVoted}
                      color={color}/>
    )

}
