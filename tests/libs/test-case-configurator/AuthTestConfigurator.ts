import * as auth0 from "@auth0/nextjs-auth0";
import User from "../../../libs/parser/domain/entity/user/User";
import FakeCookieFacade from "../fakes/FakeCookieFacade";
import {setCookieFacadeOverride} from "../../../pages/api/id";
import {setCookieFacadeOverride as setCookieFacadeOverrideInAuth} from "../../../libs/api/auth";
import {DependencyContainer} from "tsyringe";
import FakeJwtTokenFacade from "../fakes/FakeJwtTokenFacade";
import JwtTokenFacade from "../../../libs/parser/infrastructure/jwt/JwtTokenFacade";

export default class AuthTestConfigurator {
  private readonly fakeCookieFacade: FakeCookieFacade;
  private readonly container: DependencyContainer;

  constructor(container: DependencyContainer) {
    this.fakeCookieFacade = new FakeCookieFacade();
    this.container = container
  }

  mockNoSession() {
    // @ts-ignore
    // noinspection JSConstantReassignment
    auth0.getSession = () => undefined as any
  }

  mockValidSession(user: User) {
    // @ts-ignore
    // noinspection JSConstantReassignment
    auth0.getSession = () => ({user: {sub: user.auth0Id}} as any)

    setCookieFacadeOverride(this.fakeCookieFacade)
    setCookieFacadeOverrideInAuth(this.fakeCookieFacade)
    this.fakeCookieFacade.set("jwt", "myToken")

    const jwtTokenFacade = new FakeJwtTokenFacade();
    this.container.register(JwtTokenFacade, {useValue: jwtTokenFacade})
    jwtTokenFacade.verifyResult = true
    jwtTokenFacade.signedData = {
      visitorId: "test-visitor-id",
      requestId: "test-request-id"
    }
  }

}
