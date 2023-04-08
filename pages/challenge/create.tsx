import Layout from '../../components/layout/Layout'
import {getSession, UserProfile, withPageAuthRequired} from "@auth0/nextjs-auth0";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import UserApplicationService from "../../libs/parser/application/user/UserApplicationService";
import User from "../../libs/parser/domain/entity/user/User";
import {toUserViewModel} from "../profile";
import ChallengeForm from "../../components/challenges/ChallengeForm";
import fs from "fs";
import GetArticlesApplicationServices
  from "../../libs/parser/application/GetArticlesApplicationServices";
import ArticleSelectionViewModel from "../../libs/interfaces/viewModels/ArticleSelectionViewModel";
import UserViewModel from "../../libs/interfaces/viewModels/UserViewModel";
import path from "path";

const container = ContainerProvider.getContainerProvider()

export default function Create(props: {
  jestTypings :string,
  userSSR: UserProfile,
  userViewModel: UserViewModel,
  userCreated: boolean,
  articleSelectionViewModels: ArticleSelectionViewModel[]
}) {

  return (
      <Layout metaTitle={"Create Coding Task Challenge"}>
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
                          Challenges
                        </p>
                        <h1 className="mt-1.5 text-3xl font-medium tracking-normal text-gray-900 sm:text-4xl md:tracking-tight lg:leading-tight">
                          Create a Coding Task Challenge
                        </h1>
                      </div>
                    </div>

                  </div>

                </div>
              </section>

              <section
                  className="px-4 py-12 mx-auto lg:max-w-screen-xl sm:px-12 md:max-w-3xl lg:px-8">
                <div className="w-full flex flex-col relative">
                  <ChallengeForm user={props.userViewModel} jestTypings={props.jestTypings} articleSelectionViewModels={props.articleSelectionViewModels}/>
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
    const getArticlesApplicationServices = container.resolve(GetArticlesApplicationServices)

    let user: User | undefined
    let created: boolean = false
    if (session) {
      const createResult = await userApplicationService.getOrCreateUser(session.user.email, session.user.sub)
      user = createResult.user
      created = createResult.created
    }

    const jestTypings = (await fs.promises.readFile(path.resolve(process.cwd(), 'pages/challenge/jest.d.ts'))).toString()

    const articles = await getArticlesApplicationServices.getAllArticles()

    const articleSelectionViewModels: ArticleSelectionViewModel[] = articles.map(a => ({
      id: a.id,
      title: a.title,
    }))

    return {
      props: {
        userSSR: session?.user,
        userViewModel: user ? toUserViewModel(user) : undefined,
        userCreated: created,
        jestTypings: jestTypings,
        articleSelectionViewModels: articleSelectionViewModels,
      },
    }
  }
});
