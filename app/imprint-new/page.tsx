import SimpleHeader from '../../components/headers/SimpleHeader'
import ContactDepartments from '../../components/contact/ContactDepartments'
import SidebarSocialLinks from '../../components/sidebar/SidebarSocialLinks'
import {getContentPage} from '../../libs/getContentPage'

export default async function About() {

  const {contact, newsletter}= getStaticProps()

  return (
      <>
        <SimpleHeader header={contact.frontmatter.header}/>

        {/* Contact main */}
        <section className="relative max-w-screen-xl py-12 mx-auto md:py-16 lg:py-24 lg:px-8">
          <div className="w-full lg:space-x-8 lg:flex lg:items-start">

            {/* Contact Information */}
            <div className="space-y-16 lg:w-2/3">
              <ContactDepartments contactInfo={contact.frontmatter.contact_info}/>
            </div>

            {/* Sticky Sidebar */}
            <div
                className="w-full max-w-xl px-4 mx-auto mt-12 space-y-8 lg:top-8 lg:sticky sm:mt-16 lg:mt-0 md:max-w-2xl sm:px-6 md:px-8 lg:px-0 lg:w-1/3 lg:max-w-none">
              <SidebarSocialLinks/>
            </div>


          </div>
        </section>


      </>
  )
}

function getStaticProps() {
  return {
      contact: getContentPage('content/pages/imprint.md'),
      newsletter: getContentPage('content/shared/newsletter.md')
  };
}
