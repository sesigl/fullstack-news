import Layout from '../components/layout/Layout'
import SimpleHeader, {SimpleHeaderProps} from '../components/headers/SimpleHeader'
import {ContactInfo} from '../components/contact/ContactDepartments'
import {LocationsInfo} from '../components/contact/ContactLocations'
import {MailInfo} from '../components/contact/ContactMail'
import SidebarSocialLinks from '../components/sidebar/SidebarSocialLinks'
import Newsletter, {NewsletterProps} from '../components/shared/Newsletter'
import {getContentPage} from '../libs/getContentPage'
import {getSession, withPageAuthRequired} from "@auth0/nextjs-auth0";
import UserApplicationService from "../libs/parser/application/user/UserApplicationService";
import ContainerProvider from "../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import Notification from "../components/profile/Notification";
import {useRouter} from "next/router";
import ChallengeApplicationService from "../libs/parser/application/ChallengeApplicationService";
import ChallengeViewModel, {
  toChallengeViewModel
} from "../libs/interfaces/viewModels/ChallengeViewModel";
import ChallengeList from "../components/challenges/ChallengeList";

const container = ContainerProvider.getContainerProvider()

export default function Challenges({
                                         content,
                                         newsletter,
                                     challenges
                                       }: {
  challenges: ChallengeViewModel[],
  content: { frontmatter: { title: string, description: string, header: SimpleHeaderProps, contact_info: ContactInfo, locations_info: LocationsInfo, mail_info: MailInfo } },
  newsletter: NewsletterProps
}) {

  const router = useRouter()

  return (
      <Layout
          metaTitle={content.frontmatter.title}
          metaDescription={content.frontmatter.description}
      >
        <SimpleHeader header={content.frontmatter.header}/>

        {/* Contact main */}
        <section className="relative max-w-screen-xl py-12 mx-auto md:py-16 lg:py-24 lg:px-8">


          <div className="-t-10">
          {
              router.query.success && <Notification absolutePos={false} autoHide={false} notification={{"type":"success", message: "Thank you for adding a new Article Source for " + router.query.success + "! You provide a lot of value to other developers.", "subMessage": "Usually, the article source is approved by our moderators, and will be parsed multiple times per day."}}/>
          }
          </div>

          <div className="w-full lg:space-x-8 lg:flex lg:items-start">

            {/* Contact Information */}
            <div className="space-y-16 lg:w-2/3">
              <ChallengeList challenges={challenges}/>
            </div>

            {/* Sticky Sidebar */}
            <div
                className="w-full max-w-xl px-4 mx-auto mt-12 space-y-8 lg:top-8 lg:sticky sm:mt-16 lg:mt-0 md:max-w-2xl sm:px-6 md:px-8 lg:px-0 lg:w-1/3 lg:max-w-none">
              <SidebarSocialLinks/>
            </div>

          </div>
        </section>

        <Newsletter newsletter={newsletter}/>
      </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {

    const session = getSession(ctx.req, ctx.res);

    const userApplicationService = container.resolve(UserApplicationService)
    const challengeApplicationService = container.resolve(ChallengeApplicationService)

    let challenges: ChallengeViewModel[] = []
    if (session) {
      const user = await userApplicationService.getUserByAuth0Id(session.user.sub)
      if (user) {
        challenges = (await challengeApplicationService.getAllFor(user.id)).map(c => toChallengeViewModel(c))
      }
    }

    return {
      props: {
        content: getContentPage('content/pages/challenges.md'),
        newsletter: getContentPage('content/shared/newsletter.md'),
        challenges: challenges
      },
    };
  }
})
