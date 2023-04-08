import Cookies from "cookies";
import {IncomingMessage, ServerResponse} from "http";
import CookieFacadeI from "./CookieFacadeI";

export default class CookieFacade implements CookieFacadeI {
  private cookies: Cookies;

  constructor(request: IncomingMessage, response: ServerResponse) {
    this.cookies = new Cookies(request, response)
  }

  get(key: string) {
    return this.cookies.get(key)
  }

  set(key: string, value: string) {
    this.cookies.set(key, value, {
      expires: this.getDateWithDaysInTheFuture(30),
      httpOnly: false // true by default
    })
  }

  delete(key: string) {
    this.cookies.set(key)
  }

  private getDateWithDaysInTheFuture(days: number) {
    const now = new Date()
    return new Date(now.setDate(now.getDate() + days));
  }

}