import {jest} from "@jest/globals";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import UserApplicationService from "../../libs/parser/application/user/UserApplicationService";
import {NextApiRequest, NextApiResponse} from "next";
import MetricPublisher from "../../libs/parser/domain/service/MetricPublisher";
import FakeJwtTokenFacade from "../../tests/libs/fakes/FakeJwtTokenFacade";
import JwtTokenFacade from "../../libs/parser/infrastructure/jwt/JwtTokenFacade";
import {handler} from "./updateUserData";
import * as auth0 from "@auth0/nextjs-auth0";
import UserFactory from "../../libs/parser/domain/entity/user/UserFactory";

describe("updateUserData", () => {

  const container = ContainerProvider.getContainerProvider()

  let request: NextApiRequest
  let response: NextApiResponse

  let metricPublisher: MetricPublisher
  let jwtTokenFacade: FakeJwtTokenFacade;
  let userApplicationServiceMock: UserApplicationService;

  beforeEach(() => {
    request = {
      query: {},
      //cookies: '',
      headers: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    userApplicationServiceMock = {
      updateUserData: jest.fn(),
      getOrCreateUser: jest.fn(),
    } as unknown as UserApplicationService;

    container.register(UserApplicationService, {
      useValue: userApplicationServiceMock
    })

    metricPublisher = {
      incrementCounter: jest.fn()
    } as MetricPublisher

    container.register("MetricPublisher", {useValue: metricPublisher})

    jwtTokenFacade = new FakeJwtTokenFacade();

    container.register(JwtTokenFacade, {useValue: jwtTokenFacade})
  })

  it("returns 401 if no session", async () => {
    await handler(request, response)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.send).toHaveBeenCalled()
  })

  it("returns 400 for allowNewsletter fields is missing", async () => {
    mockValidSession();

    request.body = {
      displayName: "displayNameValue"
    }

    await handler(request, response)

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalledWith("allowNewsletter required")
  })

  it("returns 400 for displayName fields is missing", async () => {
    mockValidSession();

    request.body = {
      allowNewsletter: true
    }

    await handler(request, response)

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalledWith("displayName required")
  })

  it("calls application service and returns 200 when everything was given", async () => {
    mockValidSession();
    userApplicationServiceMock.updateUserData = (auth0Id, changeData) => Promise.resolve(
        new UserFactory().createFromExisting({
          auth0Id: auth0Id,
          displayName: changeData.displayName as string,
          email: "email",
          id: "id"
        }, {allowNewsletter: changeData.allowNewsletter as boolean, favoriteCategories: []})
    )

    request.body = {
      allowNewsletter: true,
      displayName: "newDisplayName",
      favoriteCategories: [],
    }

    await handler(request, response)

    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({
      "allowNewsletter": true,
      "auth0Id": "auth0Id",
      "displayName": "newDisplayName",
      "email": "email",
      "id": "id",
      "favoriteCategories": [],
    })
  })

  function mockValidSession() {
    // @ts-ignore
    // noinspection JSConstantReassignment
    auth0.getSession = () => ({user: {sub: "auth0Id"}} as any)
  }
})
