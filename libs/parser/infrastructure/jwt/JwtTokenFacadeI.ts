import {JwtPayload} from "./JwtTokenFacade";

export default interface JwtTokenFacadeI {
  sign(data: Record<string, string>): string

  verify(token: string): JwtPayload
}