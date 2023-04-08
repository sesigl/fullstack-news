import ContainerProvider from "../infrastructure/dependencyInjection/ContainerProvider";
import FakeUserRepository from "../../../tests/libs/fakes/FakeUserRepository";
import UserApplicationService from "./user/UserApplicationService";
import MetricPublisher from "../domain/service/MetricPublisher";
import FakeNewsletterClient from "../../../tests/libs/fakes/FakeNewsletterClient";

describe("UserApplicationService", () => {

  const container = ContainerProvider.getContainerProvider()

  let userRepository: FakeUserRepository
  let userApplicationService: UserApplicationService
  let metricPublisher: MetricPublisher
  let fakeNewsletterClient: FakeNewsletterClient;

  beforeEach(() => {

    userRepository = new FakeUserRepository();
    container.register("UserRepository", {useValue: userRepository})

    metricPublisher = {
      incrementCounter: jest.fn()
    }
    container.register("MetricPublisher", {useValue: metricPublisher})


    fakeNewsletterClient = new FakeNewsletterClient();
    container.register("NewsletterClient", {useValue: fakeNewsletterClient})

    userApplicationService = container.resolve(UserApplicationService)
  })

  describe('getOrCreateUser', () => {
    it("creates a new user", async () => {
      const {email, auth0Id, user, created} = await getOrCreateUser(userApplicationService);

      expect(created).toBe(true)
      expect(user.id.length).toBeGreaterThan(0)
      expect(user.email).toBe(email)
      expect(user.auth0Id).toBe(auth0Id)
      expect(user.displayName).toBe("test")
      expect(user.profile.allowNewsletter).toBe(false)
      expect(metricPublisher.incrementCounter).toHaveBeenCalledWith('user.created', 1)
    })

    it("returns existing user", async () => {
      await getOrCreateUser(userApplicationService);
      const {email, user, created} = await getOrCreateUser(userApplicationService);

      expect(created).toBe(false)
      expect(user.email).toBe(email)
      expect(metricPublisher.incrementCounter).toHaveBeenCalledWith('user.login', 1)
    })
  })

  describe('updateUserData', () => {
    it("updates display name", async () => {
      const {user} = await getOrCreateUser(userApplicationService);

      const updatedUser = await userApplicationService.updateUserData(user.auth0Id, {
        displayName: "newName",
      })

      expect(updatedUser.id).toBe(user.id)
      expect(updatedUser.displayName).toBe("newName")
    })

    describe('newsletter flag', () => {
      it("updates newsletter flag", async () => {
        const {user} = await getOrCreateUser(userApplicationService);

        const updatedUser = await userApplicationService.updateUserData(user.auth0Id, {
          allowNewsletter: true
        })

        expect(updatedUser.id).toBe(user.id)
        expect(updatedUser.profile.allowNewsletter).toBe(true)
      })

      it("registers and deregisters the mail to newsletter", async () => {
        const {user} = await getOrCreateUser(userApplicationService);

        await userApplicationService.updateUserData(user.auth0Id, {
          allowNewsletter: true
        })

        expect(fakeNewsletterClient.contacts).toContain(user.email)

        await userApplicationService.updateUserData(user.auth0Id, {
          allowNewsletter: false
        })

        expect(fakeNewsletterClient.contacts).not.toContain(user.email)
      })
    })
  })

  async function getOrCreateUser(userApplicationService: UserApplicationService) {
    const email = 'test@example.com'
    const auth0Id = 'auth0Id'
    const {created, user} = await userApplicationService.getOrCreateUser(email, auth0Id)
    return {email, auth0Id, user, created};
  }

})
