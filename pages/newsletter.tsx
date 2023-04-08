import Layout from '../components/layout/Layout'
import {getContentPage} from '../libs/getContentPage'
import Newsletter, {NewsletterProps} from '../components/shared/Newsletter'

export default function NewsletterPage({
                                  newsletter
                              }: { newsletter: NewsletterProps }) {
    return (
        <Layout
            metaTitle={newsletter.frontmatter.title}
            metaDescription={newsletter.frontmatter.description}
        >
            <div id="signup">
                <Newsletter newsletter={newsletter} extraContent={
                    <div>
                        <p className="mt-4 text-xl leading-relaxed">
                            🧨 Receive extended articles and exclusive material 🧨
                        </p>
                        <p className="mt-2 text-lg leading-relaxed text-gray-500">
                            Although I share software engineering best practices via Twitter, by
                            signing up you get more comprehensive articles, which are not limited by 280 characters.
                        </p>
                    </div>
                }/>
            </div>
        </Layout>
    )
}

export async function getStaticProps() {
    return {
        props: {
            newsletter: getContentPage('content/shared/newsletter.md')
        },
    };
}
