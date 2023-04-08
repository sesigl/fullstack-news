import Layout from '../../../components/layout/Layout'
import {Author, getAuthors} from '../../../libs/getAuthors'
import {getAllPostsIsr, getNextArticle} from '../../../libs/getPosts'
import PostCmp from '../../../components/posts/PostCmp'
import NextArticle from '../../../components/posts/NextArticle'
import Newsletter, {NewsletterProps} from '../../../components/shared/Newsletter'
import {getContentPage} from '../../../libs/getContentPage'
import {GetStaticPropsContext} from "next";
import SortMode from "../../../libs/interfaces/SortMode";
import {getSlug} from '../../../libs/parser/domain/entity/article/functions/getArticlePageLink'
import Post from "../../../libs/interfaces/viewModels/Post";

export default function PostPage({
                                     post,
                                     authors,
                                     nextArticle,
                                     newsletter
                                 }: {
    id: string,
    post: Post,
    authors: Author[],
    nextArticle: Post,
    newsletter: NewsletterProps
}) {

    return (
        <Layout
            metaTitle={post.frontmatter.title}
            metaDescription={post.frontmatter.description}
            ogImage={post.frontmatter.image}
        >
            <PostCmp post={post} authors={authors}/>
            <NextArticle post={nextArticle}/>
            <Newsletter newsletter={newsletter}/>
        </Layout>
    )
}

export async function getStaticPaths() {

    // let allPosts = await getAllPostsIsr(SortMode.HOT);
    //
    // const paths = allPosts.map(post => ({
    //     params: {slug: getSlug({id: post.id, title: post.frontmatter.title}), id: post.id}
    // }))

    return {
        paths: [], //paths,
        fallback: 'blocking',
    };
}

export async function getStaticProps(context: GetStaticPropsContext) {
    let allPosts = await getAllPostsIsr(SortMode.HOT);

    let article = allPosts.find(article => article.id === context?.params?.id);

    if (!article || !context?.params?.id) {
        throw new Error("Unknown article with id: " + context?.params?.id)
    }

    const nextArticle = await getNextArticle(SortMode.HOT)

    return {
        props: {
            id: context.params.id,
            post: article,
            authors: getAuthors(),
            nextArticle,
            newsletter: getContentPage('content/shared/newsletter.md')
        },
        revalidate: 1200, // In seconds
    }
}
