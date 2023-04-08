import handler from "./addUserToNewsletter";
import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import DatadogMetricPublisher
  from "../../libs/parser/infrastructure/metrics/DatadogMetricPublisher";
import {setCookieFacadeOverride} from "./id";
import {setCookieFacadeOverride as setCookieFacadeOverrideInAuth} from "../../libs/api/auth";
import FakeCookieFacade from "../../tests/libs/fakes/FakeCookieFacade";
import FakeJwtTokenFacade from "../../tests/libs/fakes/FakeJwtTokenFacade";
import JwtTokenFacade from "../../libs/parser/infrastructure/jwt/JwtTokenFacade";
import {v4 as uuidv4} from "uuid";
import NewsletterClient from "../../libs/parser/domain/service/NewsletterClient";

describe("addUserToNewsletter", () => {

  let container = ContainerProvider.getContainerProvider()

  let datadogMetricPublisher: DatadogMetricPublisher

  let request: NextApiRequest
  let response: NextApiResponse

  let fakeCookieFacade: FakeCookieFacade
  let jwtTokenFacade: FakeJwtTokenFacade

  let beforeConsoleError: any

  const newsletterClient = container.resolve<NewsletterClient>("NewsletterClient")

  beforeEach(() => {
    request = {
      query: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    datadogMetricPublisher = new DatadogMetricPublisher();
    jest.spyOn(datadogMetricPublisher, 'incrementCounter')
    container.register("MetricPublisher", {useValue: datadogMetricPublisher})

    fakeCookieFacade = new FakeCookieFacade();
    setCookieFacadeOverride(fakeCookieFacade)
    setCookieFacadeOverrideInAuth(fakeCookieFacade)

    jwtTokenFacade = new FakeJwtTokenFacade();
    container.register(JwtTokenFacade, {useValue: jwtTokenFacade})

    beforeConsoleError = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = beforeConsoleError
  })

  it("returns 40x when no jwt token is given", async () => {
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalled()
  })

  describe("existing jwt token", () => {

    beforeEach(() => {
      jwtTokenFacade.verifyResult = true
      fakeCookieFacade.set("jwt", "myToken")

      jwtTokenFacade.signedData = {
        visitorId: "test-visitor-id",
        requestId: "test-request-id"
      }
    })


    it("adds a new mail subscriber", async () => {
      let testEmail = "test-" + uuidv4() + "@example.com";
      request.body = {
        email: testEmail
      }

      await handler(request, response)

      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('subscriber.increment', 1)
      expect(response.status).toHaveBeenCalledWith(201)
      expect(response.send).toHaveBeenCalled()

      await newsletterClient.deleteEmailFromNewsletter(testEmail)
    })

    it("returns 500 and throws error for invalid mail", async () => {
      request.body = {
        email: "no-mail"
      }

      await handler(request, response)

      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith('subscriber.error', 1)
      expect(response.status).toHaveBeenCalledWith(500)
      expect(response.send).toHaveBeenCalled()
    })
  })
})
