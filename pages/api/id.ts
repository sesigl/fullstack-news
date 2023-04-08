import ContainerProvider
  from "../../libs/parser/infrastructure/dependencyInjection/ContainerProvider";
import {NextApiRequest, NextApiResponse} from "next";
import VisitorApplicationService from "../../libs/parser/application/VisitorApplicationService";
import JwtTokenFacade from "../../libs/parser/infrastructure/jwt/JwtTokenFacade";
import CookieFacadeI from "../../libs/parser/infrastructure/cookie/CookieFacadeI";
import CookieFacade from "../../libs/parser/infrastructure/cookie/CookieFacade";
import {isJwtTokenValid} from "../../libs/api/auth";
import MetricPublisher from "../../libs/parser/domain/service/MetricPublisher";

let container = ContainerProvider.getContainerProvider();

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  await recordPageVisit(request);

  if (await isJwtTokenValid(request, response)) {
    response.status(200).send("")
    return
  }

  await checkVisitorDataAndCreateNewJwtToken(request, response);
}

export async function checkVisitorDataAndCreateNewJwtToken(request: NextApiRequest, response: NextApiResponse) {
  let visitorApplicationService = container.resolve(VisitorApplicationService);
  let datadogMetricPublisher = container.resolve<MetricPublisher>("MetricPublisher");
  let jwtTokenFacade = container.resolve(JwtTokenFacade);
  let cookieFacade = getCookieFacade(request, response)

  let visitorId = request.query.visitorId;
  let requestId = request.query.requestId;

  if (visitorId && typeof visitorId === "string" && requestId && typeof requestId === "string") {
    const isValidVisitorPageVisit = await visitorApplicationService.checkVisitorIdAndRecordPageVisit(visitorId, requestId)
    if (isValidVisitorPageVisit) {
      await createJwtTokenAndStoreInCookie(visitorId, requestId);
    }
    response.status(200).send("")
  } else {
    await datadogMetricPublisher.incrementCounter('cookie.missingParameters', 1)
    response.status(400).send("")
  }

  async function createJwtTokenAndStoreInCookie(visitorId: string, requestId: string) {
    cookieFacade.set('jwt', createJwtToken(visitorId, requestId));
    await datadogMetricPublisher.incrementCounter('cookie.store', 1)
  }

  function createJwtToken(visitorId: string, requestId: string) {
    return jwtTokenFacade.sign({
      visitorId: visitorId,
      requestId: requestId
    });
  }
}

let cookieFacadeOverride: CookieFacadeI | undefined

function getCookieFacade(request: NextApiRequest, response: NextApiResponse): CookieFacadeI {
  if (cookieFacadeOverride) {
    return cookieFacadeOverride
  }
  return new CookieFacade(request, response);
}

export function setCookieFacadeOverride(cookieFacade: CookieFacadeI) {
  cookieFacadeOverride = cookieFacade
}

async function recordPageVisit(request: NextApiRequest) {
  const path = request.headers?.referer ? new URL(request.headers.referer).pathname : 'unknown'
  let metricPublisher = container.resolve<MetricPublisher>("MetricPublisher");
  await metricPublisher.incrementCounter('pagevisit', 1, {path: path})
}
