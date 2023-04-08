import CookieFacadeI from "../../../libs/parser/infrastructure/cookie/CookieFacadeI";

export default class FakeCookieFacade implements CookieFacadeI {
  values: Record<string, string> = {};
  deleted: string[] = []

  get(key: string) {
    return this.values[key]
  }

  set(key: string, value: string) {
    this.values[key] = value
  }

  delete(key: string) {
    this.deleted.push(key)
    delete this.values[key]
  }

}