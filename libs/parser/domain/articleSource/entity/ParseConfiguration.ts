import FieldConfiguration from "./fieldConfiguration/FieldConfiguration";
import WhiteListConfiguration from "./WhiteListConfiguration";
import CurateConfiguration from "./CurateConfiguration";

export default class ParseConfiguration {
  constructor(
      public titleField: FieldConfiguration,
      public categoriesField: FieldConfiguration,
      public descriptionField: FieldConfiguration,
      public authorField: FieldConfiguration,
      public imageLinkField: FieldConfiguration,
      public externalArticleLinkField: FieldConfiguration,
      public parsedAtField: FieldConfiguration,
      public whiteListConfigurations: WhiteListConfiguration[] = [],
      public curateConfigurations: CurateConfiguration[] = [],
  ) {
  }

}
