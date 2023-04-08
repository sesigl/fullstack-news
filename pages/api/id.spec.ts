import {NextApiRequest, NextApiResponse} from "next";
import {beforeEach} from "@jest/globals";
import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import DatadogMetricPublisher
  from "../../libs/parser/infrastructure/metrics/DatadogMetricPublisher";
import VisitRepository from "../../libs/parser/domain/entity/visit/VisitRepository";
import Visit from "../../libs/parser/domain/entity/visit/Visit";
import handler, * as id from "./id";
import {setCookieFacadeOverride} from "./id";
import {setCookieFacadeOverride as setCookieFacadeOverrideInAuth} from "../../libs/api/auth";
import JwtTokenFacade from "../../libs/parser/infrastructure/jwt/JwtTokenFacade";
import FakeCookieFacade from "../../tests/libs/fakes/FakeCookieFacade";
import FakeJwtTokenFacade from "../../tests/libs/fakes/FakeJwtTokenFacade";

describe("id", () => {
  let beforeConsoleWarn: { (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; (...data: any[]): void; (message?: any, ...optionalParams: any[]): void; }
  let container = ContainerProvider.getContainerProvider()

  let visitRepository: InMemoryVisitRepository
  let datadogMetricPublisher: DatadogMetricPublisher

  let jwtTokenFacade: FakeJwtTokenFacade
  let fakeCookieFacade: FakeCookieFacade

  let request: NextApiRequest
  let response: NextApiResponse

  beforeEach(() => {
    request = {
      query: {}
    } as NextApiRequest;

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
      setHeader: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    container.reset()

    visitRepository = new InMemoryVisitRepository();
    container.register("VisitRepository", {useValue: visitRepository})

    jwtTokenFacade = new FakeJwtTokenFacade();
    container.register(JwtTokenFacade, {useValue: jwtTokenFacade})

    datadogMetricPublisher = new DatadogMetricPublisher();
    jest.spyOn(datadogMetricPublisher, 'incrementCounter')
    container.register("MetricPublisher", {useValue: datadogMetricPublisher})
    beforeConsoleWarn = console.warn

    fakeCookieFacade = new FakeCookieFacade();
    setCookieFacadeOverride(fakeCookieFacade)
    setCookieFacadeOverrideInAuth(fakeCookieFacade)

    console.warn = jest.fn()
  })

  afterEach(() => {
    console.warn = beforeConsoleWarn
  })

  describe('existing jwt', () => {

    beforeEach(() => {
      jwtTokenFacade.verifyResult = true
      fakeCookieFacade.set("jwt", "myToken")
    })

    describe('valid token', () => {
      it('returns 200', async function () {
        await handler(request, response)

        expect(jwtTokenFacade.verifiedToken).toBe("myToken")
        expect(jwtTokenFacade.signedData).toEqual({})
      });

      it('increments valid token counter', async function () {
        await handler(request, response)

        expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith("jwt.valid", 1)
      });

      it('increments page visit', async function () {
        await handler(request, response)

        expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith("visit.valid", 1)
      });
    })

    describe('invalid token', () => {

      beforeEach(() => {
        jwtTokenFacade.verifyResult = false
        fakeCookieFacade.set("jwt", "myToken")
      })

      it('delete the existing cookie', async function () {
        await handler(request, response)
        expect(fakeCookieFacade.deleted).toContain("jwt")
      });

      it('increments jwt.exception counter', async function () {
        await handler(request, response)
        expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith("jwt.exception", 1)

      });

      it('logs warn', async function () {
        await handler(request, response)
        expect(console.warn).toHaveBeenCalledWith(new Error("verification error"))
      });
    })
  })

  describe('no jwt token', () => {
    it("returns 40x when no or wrong parameter given", async () => {
      await handler(request, response)
      expect(response.status).toHaveBeenCalledWith(400)
      expect(response.send).toHaveBeenCalled()
    })

    it("returns logs warnings because of no recorded visit", async () => {
      request.query.visitorId = "visitorId"
      request.query.requestId = "requestId"

      await handler(request, response)
      expect(response.status).toHaveBeenCalledWith(200)
      expect(response.send).toHaveBeenCalled()

      expect(console.warn).toHaveBeenCalledWith("Recorded page visit with unknown visitor id ['visitorId'] or request-id ['requestId']")
      expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith("visit.invalid", 1)
    })

    describe('all parameter given and visits exist', () => {

      beforeEach(() => {
        request.query.visitorId = "visitorId"
        request.query.requestId = "requestId"
        visitRepository.visits = [new Visit(new Date(Date.now()))]
      })

      it("returns 20x when all parameter given and visits exist", async () => {
        await handler(request, response)

        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalled()

        expect(console.warn).not.toHaveBeenCalled()
        expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith("visit.valid", 1)
      })

      it("create cookie with jwt token", async () => {
        await handler(request, response)
        expect(fakeCookieFacade.values.jwt).toBe('encryptedJwtToken')
      })

      it("increment cookie store counter", async () => {
        await handler(request, response)
        expect(datadogMetricPublisher.incrementCounter).toHaveBeenCalledWith("cookie.store", 1)
      })
    })
  })


  class InMemoryVisitRepository implements VisitRepository {

    visits: Visit[] = []

    findVisitorVisitsBy(visitorId: string, visitorRequestId: string): Promise<Visit[]> {
      return Promise.resolve(this.visits);
    }
  }


})
