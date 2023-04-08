import FieldConfiguration from "./FieldConfiguration";

export default class StaticFieldConfiguration implements FieldConfiguration {

  constructor(public value: string[] | string) {
  }
}
