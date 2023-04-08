import Layout from '../components/layout/Layout'
import {SimpleHeaderProps} from '../components/headers/SimpleHeader'
import SidebarSocialLinks from '../components/sidebar/SidebarSocialLinks'
import Newsletter, {NewsletterProps} from '../components/shared/Newsletter'
import {getContentPage} from '../libs/getContentPage'
import {useEffect, useState} from "react";

export default function Cookie({
                                 privacy,
                                 newsletter,
                               }: { privacy: { content: string, frontmatter: { title: string, description: string, header: SimpleHeaderProps } }, newsletter: NewsletterProps }) {
  const [timestamp, setTimestamp] = useState(0)

  useEffect(() => {
    setTimestamp(new Date().getTime())
  }, [])

  useEffect(() => {
    (function (d, s, id) {
      var js, tjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      // @ts-ignore
      js.src = "https://app.termly.io/embed-policy.min.js";
      // @ts-ignore
      tjs.parentNode.insertBefore(js, tjs);
    }(document, 'script', 'termly-jssdk' + timestamp))
  })

  return (
      <Layout
          metaTitle={privacy.frontmatter.title}
          metaDescription={privacy.frontmatter.description}
      >

        {/* Main Content */}
        <section className="max-w-screen-xl py-12 mx-auto md:py-16 lg:py-20 lg:px-8">
          <div className="w-full lg:space-x-8 lg:flex">

            {/* Page Content */}
            <div className="lg:w-2/3">

              {/* Uses the official Tailwind CSS Typography plugin */}
              <div
                  className="px-5 sm:px-6 md:px-8 lg:px-0 mx-auto lg:mx-0 prose sm:prose-lg hover:prose-a:text-red-700 prose-a:duration-300 prose-a:ease-in-out prose-a:transition prose-img:rounded-xl first-letter:text-4xl first-letter:font-bold first-letter:tracking-[.15em]">
                {
                  //@ts-ignore
                  <div name="termly-embed" data-id="1120ffde-26f9-47c1-92fd-d6ea370e0dcb"
                       data-type="iframe"/>
                }
              </div>

            </div>

            {/* Sidebar */}
            <div
                className="w-full max-w-xl px-4 mx-auto mt-12 space-y-8 sm:mt-16 lg:mt-0 md:max-w-2xl sm:px-6 md:px-8 lg:px-0 lg:w-1/3 lg:max-w-none">
              {/*
                <SidebarArticles posts={popularPosts} header="Most read articles"/>
                */}
              <SidebarSocialLinks/>
            </div>

          </div>
        </section>

        <Newsletter newsletter={newsletter}/>
      </Layout>
  )
}

export async function getStaticProps() {
  return {
    props: {
      privacy: getContentPage('content/pages/privacy.md'),
      newsletter: getContentPage('content/shared/newsletter.md')
    },
  }
}
