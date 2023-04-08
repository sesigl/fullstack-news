import FieldConfiguration from "./FieldConfiguration";

export default class DynamicFieldConfiguration implements FieldConfiguration {

  constructor(public objectPath: string, public extractRegExp: RegExp | undefined = undefined) {
  }

}
