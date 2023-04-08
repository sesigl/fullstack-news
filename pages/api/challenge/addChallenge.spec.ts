import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import ContainerProvider
  from "../../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import FakeMetricPublisher from "../../../tests/libs/fakes/FakeMetricPublisher";
import AuthTestConfigurator from "../../../tests/libs/test-case-configurator/AuthTestConfigurator";
import RequestResponseFakeFactory from "../../../tests/libs/factory/RequestResponseFakeFactory";
import {handler} from "./addChallenge";
import UserFakeFactory from "../../../tests/libs/factory/UserFakeFactory";
import FakeUserRepository from "../../../tests/libs/fakes/FakeUserRepository";
import {CreateChallengeCommand} from "../../../libs/interfaces/commands/CreateChallengeCommand";
import {UpdateChallengeCommand} from "../../../libs/interfaces/commands/UpdateChallengeCommand";
import ProgrammingLanguageViewModel from "./ProgrammingLanguageViewModel";
import FakeJwtTokenFacade from "../../../tests/libs/fakes/FakeJwtTokenFacade";
import InMemoryChallengeRepository
  from "../../../libs/parser/infrastructure/inmemory/InMemoryChallengeRepository";

describe("addChallenge", () => {

  let container = ContainerProvider.getContainerProvider()

  let metricPublisher: FakeMetricPublisher
  let userRepository: FakeUserRepository;
  let authTestConfigurator: AuthTestConfigurator;
  let challengeRepository: InMemoryChallengeRepository;

  let request: NextApiRequest
  let response: NextApiResponse

  let jwtTokenFacade: FakeJwtTokenFacade

  beforeEach(() => {

    const reqResp = new RequestResponseFakeFactory().get()
    request = reqResp.request
    response = reqResp.response

    userRepository = new FakeUserRepository();
    container.register("UserRepository", {useValue: userRepository})

    metricPublisher = new FakeMetricPublisher();
    container.register("MetricPublisher", {useValue: metricPublisher})

    challengeRepository = new InMemoryChallengeRepository();
    container.register("ChallengeRepository", {useValue: challengeRepository})

    authTestConfigurator = new AuthTestConfigurator(container);
    authTestConfigurator.mockNoSession()
  })

  it("returns 400 if fields are missing", async () => {
    const user = new UserFakeFactory().getWithCategory("cat1")
    authTestConfigurator.mockValidSession(user)
    userRepository.users = [user]

    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
  })

  it("returns 401 when not logged in", async () => {
    authTestConfigurator.mockNoSession()

    request.body = getCreateChallengePayload()

    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
  })

  it("stores a new challenge", async () => {
    const user = new UserFakeFactory().getWithCategory("cat1")
    authTestConfigurator.mockValidSession(user)
    userRepository.users = [user]

    let createChallengePayload = getCreateChallengePayload();
    request.body = createChallengePayload

    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(201)
    const allChallenges = await challengeRepository.findAll()

    expect(allChallenges[2].challengeName).toBe(createChallengePayload.challengeName)
  })

  it("stores updates an existing challenge", async () => {
    const user = new UserFakeFactory().getWithCategory("cat1")
    authTestConfigurator.mockValidSession(user)
    userRepository.users = [user]

    let createChallengePayload = getCreateChallengePayload();
    request.body = createChallengePayload

    await handler(request, response)
    const allChallenges = await challengeRepository.findAll()

    const updateChallengePayload = geUpdateChallengePayload(allChallenges[2].id, "updatedName")
    request.body = updateChallengePayload

    expect(createChallengePayload.challengeName).not.toBe(updateChallengePayload.challengeName)

    await handler(request, response)

    const allChallengesAfterUpdate = await challengeRepository.findAll()
    expect(response.status).toHaveBeenCalledWith(201)
    expect(allChallengesAfterUpdate[2].challengeName).toBe(updateChallengePayload.challengeName)
  })

})

function getCreateChallengePayload() {
  const payload: Omit<CreateChallengeCommand, "auth0UserId"> = {
    // id
    type: "create",

    challengeName: "challengeName",
    description: "description",
    goal: "goal",

    articleIds: [],

    programmingLanguage: ProgrammingLanguageViewModel.JAVASCRIPT,
    exampleSolution: "exampleSolution",
    templateSolution: "templateSolution",
    testCode: "testCode"
  };
  return payload
}

function geUpdateChallengePayload(id: string, nameUpdate: string) {
  let payload: Omit<UpdateChallengeCommand, "auth0UserId"> = {
    id: id,
    type: "update",

    challengeName: nameUpdate,
    description: "description",
    goal: "goal",

    articleIds: [],

    programmingLanguage: ProgrammingLanguageViewModel.JAVASCRIPT,
    exampleSolution: "exampleSolution",
    templateSolution: "templateSolution",
    testCode: "testCode",
  };
  return payload;
}
