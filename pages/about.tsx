import Layout from '../components/layout/Layout'
import AboutHeader, {HeaderProps} from '../components/about/AboutHeader'
import AboutContent from '../components/about/AboutContent'
import {PartnerSection} from '../components/about/Partners'
import Team, {TeamSection} from '../components/about/Team'
import Careers, {CareersProps} from '../components/about/Careers'
import Newsletter, {NewsletterProps} from '../components/shared/Newsletter'
import {Author, getAuthors} from '../libs/getAuthors'
import {getContentPage} from '../libs/getContentPage'

export default function About({
                                about,
                                authors,
                                newsletter
                              }: { about: { content: string, frontmatter: { header: HeaderProps, title: string, description: string, content: string, partner_section: PartnerSection, team_section: TeamSection, careers: CareersProps } }, authors: Author[], newsletter: NewsletterProps }) {
  return (
      <Layout
          metaTitle={about.frontmatter.title}
          metaDescription={about.frontmatter.description}
      >
        <AboutHeader header={about.frontmatter.header}/>
        <AboutContent content={about.content}/>
        {/* <Partners partnerSection={about.frontmatter.partner_section}/> */}
        <Team teamSection={about.frontmatter.team_section} authors={authors}/>
        <Careers careers={about.frontmatter.careers}/>
        <Newsletter newsletter={newsletter}/>
      </Layout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      authors: getAuthors(),
      about: getContentPage('content/pages/about.md'),
      newsletter: getContentPage('content/shared/newsletter.md')
    },
  }
}
