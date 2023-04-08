import jwt from "jsonwebtoken";
import {injectable} from "tsyringe";
import JwtTokenFacadeI from "./JwtTokenFacadeI";

const JWT_SECRET = '1091jn1982h812n12h4081n0b4n103n';

export interface JwtPayload {
  visitorId: string,
  requestId: string
}

@injectable()
export default class JwtTokenFacade implements JwtTokenFacadeI {
  sign(data: Record<string, string>) {
    return jwt.sign(data, JWT_SECRET, {expiresIn: '30d'});
  }

  verify(token: string): JwtPayload {
    let verify = jwt.verify(token, JWT_SECRET);
    
    return {
      // @ts-ignore
      visitorId: verify.visitorId,
      // @ts-ignore
      requestId: verify.requestId,
    }
  }
}