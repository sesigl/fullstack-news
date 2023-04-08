import Layout from '../../components/layout/Layout'
import {getSession, withPageAuthRequired} from "@auth0/nextjs-auth0";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import UserApplicationService from "../../libs/parser/application/user/UserApplicationService";
import ArticleSourceForm from "../../components/article-sources/ArticleSourceForm";
import ArticleSourcesApplicationService
  from "../../libs/parser/application/ArticleSourcesApplicationService";
import {
  ArticleSourceViewModel,
  toArticleSourceViewModel
} from "../../libs/interfaces/viewModels/ArticleSourceOverviewViewModel";
import {getContentPage} from "../../libs/getContentPage";
import {toUserViewModel} from "../profile";
import UserViewModel from "../../libs/interfaces/viewModels/UserViewModel";

const container = ContainerProvider.getContainerProvider()

export default function ArticleSourceId({
                                          articleSource,
                                          userViewModel
                                        }: {
  userViewModel: UserViewModel
  articleSource: ArticleSourceViewModel,
}) {

  return (
      <Layout metaTitle={"Create RSS Feed Article Source"}>
        <>
          {
            <>
              <section className="py-12 sm:py-16 bg-gray-50 md:py-20 lg:py-24">
                <div
                    className="max-w-xl px-6 mx-auto lg:max-w-screen-xl sm:px-12 md:max-w-3xl lg:px-8">

                  {/* Container */}
                  <div className="flex flex-col items-center w-full md:flex-row md:justify-between">

                    <div className="flex flex-col items-center md:flex-row">

                      {/* Image */}
                      <div className="mt-6 text-center md:ml-5 md:mt-0 md:text-left">
                        <p className="text-xs tracking-widest text-red-700 uppercase">
                          Article Sources
                        </p>
                        <h1 className="mt-1.5 text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl md:tracking-tight lg:leading-tight">
                          Create RSS Feed Article Source
                        </h1>
                      </div>
                    </div>

                  </div>

                </div>
              </section>

              <section
                  className="px-4 py-12 mx-auto lg:max-w-screen-xl sm:px-12 md:max-w-3xl lg:px-8">
                <div className="w-full flex flex-col relative">
                  <ArticleSourceForm user={userViewModel} articleSource={articleSource}/>
                </div>

              </section>

            </>
          }
        </>
      </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {

    const session = getSession(ctx.req, ctx.res);

    const userApplicationService = container.resolve(UserApplicationService)
    const articleSourcesApplicationService = container.resolve(ArticleSourcesApplicationService)

    let articleSourceViewModel: ArticleSourceViewModel | null = null
    let user = undefined
    if (session) {
      user = await userApplicationService.getUserByAuth0Id(session.user.sub)
      if (user) {
        let articleSource = await articleSourcesApplicationService.get(ctx.params?.id as string);
        articleSourceViewModel = articleSource ? toArticleSourceViewModel(articleSource) : null
      }
    }

    return {
      props: {
        content: getContentPage('content/pages/article-sources.md'),
        newsletter: getContentPage('content/shared/newsletter.md'),
        articleSource: articleSourceViewModel,
        userViewModel: user ? toUserViewModel(user) : undefined,
      },
    };
  }
});
