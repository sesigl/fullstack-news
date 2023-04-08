import Layout from '../../components/layout/Layout'
import Newsletter, {NewsletterProps} from '../../components/shared/Newsletter'
import TagHeader from '../../components/headers/TagHeader'
import SingleColFeed from '../../components/shared/SingleColFeed'
import SidebarAd from '../../components/sidebar/SidebarAd'
import SidebarSocialLinks from '../../components/sidebar/SidebarSocialLinks'
import Pagination from '../../components/shared/Pagination'
import {getContentPage} from '../../libs/getContentPage'
import {getPostsWithTag} from '../../libs/getPosts'
import {Author} from '../../libs/getAuthors'
import {GetServerSidePropsContext} from "next";
import Post from "../../libs/interfaces/viewModels/Post";

export default function TagPage({
                                    tag,
                                    newsletter,
                                    posts,
                                }: {
    tag: string,
    authors: Author[],
    newsletter: NewsletterProps,
    posts: Post[],
    popularPosts: Post[]
}) {
    return (
        <Layout metaTitle={`Showing posts with tag: ${tag}`}>
            <TagHeader tag={tag}/>

            {/* Feed with Sidebar */}
            <section
                className="relative max-w-xl px-4 py-12 mx-auto lg:max-w-screen-xl sm:py-16 lg:py-24 sm:px-12 md:max-w-3xl lg:px-8">
                <div className="w-full lg:grid lg:gap-8 xl:gap-12 lg:grid-cols-3">

                    <div className="col-span-2">

                        {/* Articles */}
                        <div
                            className={`${posts.length > 7 ? 'pb-8 mb-6 border-b-2 border-gray-100 sm:pb-10 sm:mb-10' : ''}`}>
                            <SingleColFeed posts={posts.slice(0, 7)}/>
                        </div>

                        {posts.length > 7 && (
                            <Pagination/>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full mt-12 space-y-8 sm:mt-16 lg:mt-0 lg:col-span-1">
                        <SidebarSocialLinks/>
                        {/*
                <SidebarArticles posts={popularPosts} header="Most read articles"/>
                */}
                        <SidebarAd/>
                    </div>

                </div>
            </section>

            <Newsletter newsletter={newsletter}/>
        </Layout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const slug = context.params?.slug as string
    const tag = slug
        .charAt(0)
        .toUpperCase() + slug.slice(1).replace(/-/g, ' ')

    return {
        props: {
            tag,
            newsletter: getContentPage('content/shared/newsletter.md'),
            posts: await getPostsWithTag(context, slug)
        },
    }
}
