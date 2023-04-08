import {useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor, Descendant, Node} from "slate";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{text: ''}],
  },
]

const serialize = (nodes: Node[]) => {
  return nodes.map((n: Node) => Node.string(n)).join('\n')
}

export default function ChallengeTextEditor({description}: {description: string}) {

  const [editor] = useState(() => withReact(createEditor()))
  const [, setCommentValue] = useState(serialize(initialValue))

  return <Slate editor={editor} value={initialValue}
                onChange={(nodes) => {
                  let serializedNodesContent = serialize(nodes);
                  setCommentValue(serializedNodesContent)
                }}
  >
    <div className="flex flex-col bg-gray-100 rounded p-5 editor">
      <Editable className={"border-b"}
                placeholder={description}/>
    </div>
  </Slate>
}
