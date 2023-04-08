import Layout from '../components/layout/Layout'
import {getSession, UserProfile, withPageAuthRequired} from "@auth0/nextjs-auth0";
import ProfileHeader from "../components/headers/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import ContainerProvider from "../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import UserApplicationService from "../libs/parser/application/user/UserApplicationService";
import User from "../libs/parser/domain/entity/user/User";
import UserViewModel from "../libs/interfaces/viewModels/UserViewModel";
import MlCategoryApplicationService from "../libs/parser/application/MlCategoryApplicationService";

const container = ContainerProvider.getContainerProvider()

export default function Profile(props: { userSSR: UserProfile, userViewModel: UserViewModel, userCreated: boolean, allExistingCategories: string[] }) {

  return (
      <Layout metaTitle={props.userViewModel.displayName ?? "Your Profile"}>
        <>
          {
              props.userViewModel && props.userSSR &&
              <>
                <ProfileHeader auth0User={props.userSSR} user={props.userViewModel}/>

                <section
                    className="px-4 py-12 mx-auto lg:max-w-screen-xl sm:px-12 md:max-w-3xl lg:px-8">
                  <div className="w-full flex flex-col relative">
                    <ProfileForm user={props.userViewModel} allExistingCategories={props.allExistingCategories}/>

                  </div>
                </section>
              </>
          }
        </>
      </Layout>
  )
}

export function toUserViewModel(user: User): UserViewModel {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    auth0Id: user.auth0Id,
    allowNewsletter: user.profile.allowNewsletter,
    favoriteCategories: user.profile.favoriteCategories,
  }
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {

    const session = getSession(ctx.req, ctx.res);

    const userApplicationService = container.resolve(UserApplicationService)

    let user: User | undefined
    let created: boolean = false
    if (session) {
      const createResult = await userApplicationService.getOrCreateUser(session.user.email, session.user.sub)
      user = createResult.user
      created = createResult.created
    }

    const articleMlCategoryApplicationService = container.resolve(MlCategoryApplicationService)

    const uniqueCategories = (await articleMlCategoryApplicationService.getAll())

    return {
      props: {
        userSSR: session?.user,
        userViewModel: user ? toUserViewModel(user) : undefined,
        userCreated: created,
        allExistingCategories: uniqueCategories
      },
    }
  }
});
