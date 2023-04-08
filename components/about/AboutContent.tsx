import { marked } from 'marked'

export default function AboutContent({content}: {content: string}) {
  return (
    <section className="py-12 sm:py-20 lg:pt-24">
      
      {/* Content */}
      {/* Uses the official Tailwind CSS Typography plugin */}
      <div className="px-5 mx-auto prose prose-lg lg:columns-2 lg:gap-x-10 lg:max-w-screen-xl sm:px-6 lg:px-8 hover:prose-a:text-red-700 prose-a:duration-300 prose-a:ease-in-out prose-a:transition prose-img:rounded-xl first-letter:text-4xl first-letter:font-bold first-letter:tracking-[.15em]" dangerouslySetInnerHTML={{ __html: marked.parse(content) }}>
        
      </div>
      
    </section>
  )
}