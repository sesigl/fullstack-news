import JwtTokenFacadeI from "../../../libs/parser/infrastructure/jwt/JwtTokenFacadeI";
import {JwtPayload} from "../../../libs/parser/infrastructure/jwt/JwtTokenFacade";

export default class FakeJwtTokenFacade implements JwtTokenFacadeI {

  signedData: Record<string, string> = {}
  verifyResult: boolean = true
  verifiedToken: string = "";

  sign(data: Record<string, string>): string {
    this.signedData = data
    return "encryptedJwtToken";
  }

  verify(token: string): JwtPayload {

    this.verifiedToken = token

    if (!this.verifyResult) {
      throw Error("verification error")
    }

    return {
      visitorId: this.signedData.visitorId,
      requestId: this.signedData.requestId,
    };
  }
}