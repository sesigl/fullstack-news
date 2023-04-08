import {CommentView} from "../../libs/getPosts";
import hdate from "human-date";
import Post from "../../libs/interfaces/viewModels/Post";

export default function CommentSection(props: { post: Post, comments: CommentView[] }) {
  
  return <div>

    {props.comments.map(comment => {
          let date = new Date(comment.createdAt);
          let now = new Date()
          let millisFromNow = now.getTime() - date.getTime()
          return <div key={comment.id} className="flex flex-col bg-gray-100 rounded p-5 my-5">
            <div
                className={"text-gray-400"}>{millisFromNow < 1000 ? 'Now' : hdate.relativeTime(date)} from <b>{comment.user?.displayName ?? 'guest'}</b></div>
            <div>{comment.message}</div>
          </div>;
        }
    )}

  </div>


}
