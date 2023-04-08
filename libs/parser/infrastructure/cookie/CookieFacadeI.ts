export default interface CookieFacadeI {
  get(key: string): any;

  set(key: string, value: string): void;

  delete(key: string): void;
}