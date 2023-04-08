import { marked } from 'marked'

export interface MailInfo {heading:string, additional_info:string, address: {name: string, po_box: string, city: string, state: string, postal_code: string}}

export default function ContactMail({mailInfo}: {mailInfo: MailInfo}) {
  return (
    <div className="max-w-xl px-4 mx-auto sm:px-6 md:px-8 lg:px-0 md:max-w-2xl lg:max-w-none lg:pr-48">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">{mailInfo.heading}</h3>
     
      {/* Content */}
      <div className="relative mt-8">
        <div>
          <div className="space-y-1 text-md">
            <p className="text-gray-600">
              {mailInfo.address.name}
            </p>
            <p className="text-gray-600">
              {mailInfo.address.po_box}
            </p>
            <p className="text-gray-600">
              {`${mailInfo.address.city}, ${mailInfo.address.state ? mailInfo.address.state : ''} ${mailInfo.address.postal_code}`}
            </p>
          </div>
        </div>
        <div 
          className="mt-8 prose text-gray-500 text-md prose-a:text-gray-800 hover:prose-a:text-red-700 prose-a:duration-300 prose-a:ease-in-out prose-a:transition" 
          dangerouslySetInnerHTML={{ __html: marked.parse(mailInfo.additional_info) }}>
        </div>
      </div>

    </div>
  )
}