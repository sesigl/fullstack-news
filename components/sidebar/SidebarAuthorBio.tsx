import { marked } from 'marked'
import {Author} from "../../libs/getAuthors";

export default function SidebarAuthorBio({author}: {author: Author}) {
  return (
    <div className="w-full p-5 bg-gray-50 sm:p-8 rounded-2xl">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">About the author</h3>
      <div className="pt-6">
        <div className="text-base leading-loose text-gray-700" dangerouslySetInnerHTML={{ __html: marked.parse(author.bio) }}>
        </div>
      </div>
    </div>
  )
}