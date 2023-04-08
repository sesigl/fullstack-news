import {useEffect, useState} from "react";
import {Editable, ReactEditor, Slate, withReact} from "slate-react";
import {BaseEditor, createEditor, Descendant, Editor, Node, Transforms} from "slate";
import axios from "axios";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{text: ''}],
  },
]

const serialize = (nodes: Node[]) => {
  return nodes.map((n: Node) => Node.string(n)).join('\n')
}

const MAX_CHARS_ALLOWED = 200;
export default function CommentEditor({
                                        postId,
                                        postLink,
                                        onAfterNewComment
                                      }: { postId: string, postLink:string, onAfterNewComment: () => void }) {

  const [editor] = useState(() => withReact(createEditor()))
  const [commentValue, setCommentValue] = useState(serialize(initialValue))
  const [sending, setSending] = useState(false)
  const [commentLength, setCommentLength] = useState(serialize(initialValue).length)
  const [commentLengthExceeded, setCommentLengthExceeded] = useState(commentLength > MAX_CHARS_ALLOWED)

  useEffect(() => {
    setCommentLengthExceeded(commentLength > MAX_CHARS_ALLOWED)
  }, [commentLength])

  async function onCommentClickHandler() {
    if (!commentLengthExceeded) {
      setSending(true)

      trackEvent("Add Comment", {articlePageLink: postLink, articleId: postId})
      .catch(console.error)

      try {
        await axios.post("/api/addComment", {
          articleId: postId,
          message: commentValue
        }, {withCredentials: true})
      } finally {

        setSending(false)
      }

      Transforms.delete(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      });

      onAfterNewComment()
    }
  }

  return <Slate editor={editor} value={initialValue}
                onChange={(nodes) => {
                  let serializedNodesContent = serialize(nodes);
                  setCommentLength(serializedNodesContent.length)
                  setCommentValue(serializedNodesContent)
                }}
  >
    <div className="flex flex-col bg-gray-100 rounded p-5 ">
      <Editable className={"border-b"}
                placeholder={"What is your opinion about the article?"}/>
      <div className="flex ">
        <div className="grow ">
          <div className={commentLengthExceeded ? "text-red-700" : "text-gray-500"}>
            {commentLength} / 160
          </div>
        </div>
        <button
            onClick={onCommentClickHandler}
            className={"w-40 mt-2 text-white font-bold py-2 px-4 rounded " + (commentLengthExceeded ? "bg-gray-500" : "bg-red-700 hover:bg-red-800")}>
          {sending && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 inline-block text-white"
                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                    stroke-width="4"></circle>
            <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          }
          Comment
        </button>
      </div>
    </div>
  </Slate>
}
