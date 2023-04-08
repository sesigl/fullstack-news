import { marked } from 'marked'

interface Department { title: string, contact_name:string, email_address: string, phone_number: string }

export interface ContactInfo { heading: string, additional_info: string, departments: Department[] }

export default function ContactDepartments({contactInfo}: {contactInfo: ContactInfo}) {
  return (
    <div className="max-w-xl px-5 mx-auto sm:px-8 lg:px-0 md:max-w-2xl lg:max-w-none lg:pr-24 xl:pr-48">
      <h3 className="pb-2.5 text-2xl font-medium text-gray-900 border-b border-gray-300/70 relative before:content-[''] before:left-0 before:w-24 before:h-px before:-bottom-px before:bg-red-600 before:absolute">{contactInfo.heading}</h3>
      <div className="relative mt-10">
       
        {/* Contact Channels */}
        <div className="grid gap-12 sm:grid-cols-2">
           
          {contactInfo.departments.map((department: Department) => (
            <div key={department.title}>
              <h3 className="text-lg font-medium leading-6 text-gray-900 ">{department.title}</h3>
              <div className="mt-2 space-y-1 text-md">
                <p className="text-gray-500">{department.contact_name}</p>
                <a href={`mailto:${department.email_address}`} className="text-red-700 transition duration-300 ease-in-out hover:text-red-800">{department.email_address}</a>
                <p className="text-gray-500">
                  {department.phone_number}
                </p>
              </div>
            </div>
          ))}

        </div>

        {/* General contact email */}
        <div className="mt-10 prose text-gray-500 sm:mt-12 text-md prose-a:text-gray-800 hover:prose-a:text-red-700 prose-a:duration-300 prose-a:ease-in-out prose-a:transition" dangerouslySetInnerHTML={{ __html: marked.parse(contactInfo.additional_info) }}>
        </div>
        
      </div>
    </div>
  )
}