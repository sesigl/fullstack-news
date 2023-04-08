import Layout from '../../components/layout/Layout'
import {getSession, withPageAuthRequired} from "@auth0/nextjs-auth0";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import UserApplicationService from "../../libs/parser/application/user/UserApplicationService";
import {toUserViewModel} from "../profile";
import ChallengeForm from "../../components/challenges/ChallengeForm";
import ChallengeViewModel, {
  toChallengeViewModel
} from "../../libs/interfaces/viewModels/ChallengeViewModel";
import ChallengeApplicationService from "../../libs/parser/application/ChallengeApplicationService";
import fs from "fs";
import ArticleSelectionViewModel from "../../libs/interfaces/viewModels/ArticleSelectionViewModel";
import GetArticlesApplicationServices
  from "../../libs/parser/application/GetArticlesApplicationServices";
import UserViewModel from "../../libs/interfaces/viewModels/UserViewModel";

const container = ContainerProvider.getContainerProvider()

export default function Edit(props: {
  jestTypings :string,
  userViewModel: UserViewModel,
  challengeViewModel: ChallengeViewModel,
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
                  <ChallengeForm articleSelectionViewModels={props.articleSelectionViewModels} user={props.userViewModel} jestTypings={props.jestTypings} challenge={props.challengeViewModel}/>
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
    const challengeApplicationService = container.resolve(ChallengeApplicationService)
    const getArticlesApplicationServices = container.resolve(GetArticlesApplicationServices)

    let challengeViewModel: ChallengeViewModel | null = null
    let user = undefined
    if (session) {
      user = await userApplicationService.getUserByAuth0Id(session.user.sub)
      if (user) {
        let challenge = await challengeApplicationService.get(ctx.params?.id as string);
        challengeViewModel = challenge ? toChallengeViewModel(challenge) : null
      }
    }

    const articles = await getArticlesApplicationServices.getAllArticles()

    const articleSelectionViewModels: ArticleSelectionViewModel[] = articles.map(a => ({
      id: a.id,
      title: a.title,
    }))

    const jestTypings = (await fs.promises.readFile('pages/challenge/jest.d.ts')).toString()

    return {
      props: {
        challengeViewModel: challengeViewModel,
        userViewModel: user ? toUserViewModel(user) : undefined,
        jestTypings: jestTypings,
        articleSelectionViewModels: articleSelectionViewModels
      },
    };
  }
});
