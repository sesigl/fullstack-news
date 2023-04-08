import VisitorApplicationService from "../parser/application/VisitorApplicationService";
import JwtTokenFacade, {JwtPayload} from "../parser/infrastructure/jwt/JwtTokenFacade";
import ContainerProvider from "../parser/infrastructure/dependencyInjection/ContainerProvider";
import CookieFacadeI from "../parser/infrastructure/cookie/CookieFacadeI";
import CookieFacade from "../parser/infrastructure/cookie/CookieFacade";
import {IncomingMessage, ServerResponse} from "http";
import {NextApiRequestCookies} from "next/dist/server/api-utils";
import MetricPublisher from "../parser/domain/service/MetricPublisher";

const container = ContainerProvider.getContainerProvider()


export async function isJwtTokenValid(request: IncomingMessage & {
  cookies: NextApiRequestCookies
}, response: ServerResponse): Promise<JwtPayload | undefined> {
  let visitorApplicationService = container.resolve(VisitorApplicationService);
  let datadogMetricPublisher = container.resolve<MetricPublisher>("MetricPublisher");
  let cookieFacade = getCookieFacade(request, response)
  let jwtTokenFacade = container.resolve(JwtTokenFacade);

  const existingJwtToken = cookieFacade.get('jwt')

  try {
    if (existingJwtToken) {

      const jwtPayload = jwtTokenFacade.verify(existingJwtToken)
      await visitorApplicationService.recordPageVisit()

      datadogMetricPublisher.incrementCounter('jwt.valid', 1).catch(err => console.error(err))

      return jwtPayload
    }
  } catch (e) {
    console.warn(e)
    datadogMetricPublisher.incrementCounter('jwt.exception', 1).catch(err => console.error(err))
    cookieFacade.delete('jwt')
  }

  return undefined;
}


export function setCookieFacadeOverride(cookieFacade: CookieFacadeI) {
  cookieFacadeOverride = cookieFacade
}

let cookieFacadeOverride: CookieFacadeI | undefined

function getCookieFacade(request: IncomingMessage & {
  cookies: NextApiRequestCookies
}, response: ServerResponse): CookieFacadeI {
  if (cookieFacadeOverride) {
    return cookieFacadeOverride
  }
  return new CookieFacade(request, response);
}
