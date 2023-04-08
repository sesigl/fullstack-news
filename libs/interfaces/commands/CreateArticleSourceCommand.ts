import FieldConfigurationCommand from "./FieldConfiguartionCommand";

export interface CreateArticleSourceCommand {
  id: string | null,
  rssFeedUrl: string | null,
  parseConfiguration: {
    titleField: FieldConfigurationCommand | null
    categoriesField: FieldConfigurationCommand | null,
    descriptionField: FieldConfigurationCommand | null,
    authorField: FieldConfigurationCommand | null,
    imageLinkField: FieldConfigurationCommand | null,
    externalArticleLinkField: FieldConfigurationCommand | null,
    parsedAtField: FieldConfigurationCommand | null,
//  whiteListConfigurations: DynamicFieldConfigurationCommand[] = [],
//    curateConfigurations: CurateConfiguration[] = [],
  }
}
