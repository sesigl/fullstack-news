import UserCockroachRepository from "./UserCockroachRepository";
import UserRepository from "../../domain/entity/user/UserRepository";
import ContainerProvider from "../dependencyInjection/ContainerProvider";
import UserFactory from "../../domain/entity/user/UserFactory";
import DatabaseCleaner from "../../../../tests/libs/cockroach/DatabaseCleaner";

describe("UserCockroachRepository", () => {

  const container = ContainerProvider.getContainerProvider();
  let userRepository: UserRepository
  let factory: UserFactory
  const databaseCleaner = container.resolve(DatabaseCleaner)

  beforeEach(async () => {
    await databaseCleaner.truncateAllTables()

    userRepository = container.resolve<UserRepository>("UserRepository")
    factory = container.resolve(UserFactory)
  });

  afterEach(async () => {
    await databaseCleaner.truncateAllTables()
  });

  it("returns undefined when not existing", async () => {
    const findUser = await userRepository.findById("does not exist")
    expect(findUser).toBeUndefined()
  })

  it("stores a simple user", async () => {
    const user = factory.create({
      auth0Id: "auth0Id",
      email: "example@mail.com",
    })
    user.setFavoriteCategories(["categories"])

    const storedUser = await userRepository.upsert(user)
    expect(storedUser).toEqual(user)

    const findUser = await userRepository.findById(user.id)
    expect(findUser).toEqual(user)
  })

  it("updates a simple user", async () => {
    const user = factory.create({
      auth0Id: "auth0Id",
      email: "example@mail.com",
    })
    const storedUser = await userRepository.upsert(user)
    expect(storedUser).toEqual(user)

    storedUser.setDisplayName("newDisplayName")
    storedUser.setFavoriteCategories(["favoriteCategory"])
    storedUser.setAllowNewsletter(true)

    await userRepository.upsert(storedUser)

    const findUser = await userRepository.findById(user.id)
    expect(findUser?.id).toEqual(user.id)
    expect(findUser?.email).toEqual(user.email)
    expect(findUser?.displayName).toEqual("newDisplayName")
    expect(findUser?.profile.allowNewsletter).toEqual(true)
    expect(findUser?.profile.favoriteCategories).toEqual(["favoriteCategory"])
  })

  it("finds a user by auth0id", async () => {
    const user = factory.create({
      auth0Id: "auth0Id",
      email: "example@mail.com",
    })
    const storedUser = await userRepository.upsert(user)
    expect(storedUser).toEqual(user)

    const findUser = await userRepository.findByAuth0Id(user.auth0Id)
    expect(findUser).toEqual(user)
  })

})
