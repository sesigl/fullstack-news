import {CreateArticleSourceCommand} from "../../../interfaces/commands/CreateArticleSourceCommand";
import ArticleSource from "./entity/ArticleSource";
import ParseConfiguration from "./entity/ParseConfiguration";
import FieldConfiguration from "./entity/fieldConfiguration/FieldConfiguration";
import DynamicFieldConfiguration from "./entity/fieldConfiguration/DynamicFieldConfiguration";
import StaticFieldConfiguration from "./entity/fieldConfiguration/StaticFieldConfiguration";
import UseExistingCategoryImageFromField
  from "./entity/fieldConfiguration/UseExistingCategoryImageFromField";
import {v4 as uuidv4} from "uuid";
import FieldConfigurationCommand from "../../../interfaces/commands/FieldConfiguartionCommand";
import {injectable} from "tsyringe";

@injectable()
export default class ArticleSourceFactory {

  create(createArticleSourceCommand: CreateArticleSourceCommand, creatorUserId: string, approved: boolean): ArticleSource {
    return this.createFromExisting(createArticleSourceCommand.id ? createArticleSourceCommand.id : uuidv4(), createArticleSourceCommand, creatorUserId, approved)
  }

  createFromExisting(id: string, createArticleSourceCommand: CreateArticleSourceCommand, creatorUserId: string, approved: boolean): ArticleSource {

    let titleField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.titleField);
    let categoriesField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.categoriesField);
    let descriptionField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.descriptionField);
    let authorField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.authorField);
    let imageLinkField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.imageLinkField);
    let externalArticleLinkField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.externalArticleLinkField);
    let parsedAtField = this.getFieldConfigurationForFormFields(createArticleSourceCommand.parseConfiguration.parsedAtField);

    if (!createArticleSourceCommand.rssFeedUrl
        || !titleField
        || !categoriesField
        || !descriptionField
        || !authorField
        || !imageLinkField
        || !externalArticleLinkField
        || !parsedAtField
    ) {
      throw new Error("All fields are required, given: " + JSON.stringify(createArticleSourceCommand))
    }

    return new ArticleSource(
        id,
        createArticleSourceCommand.rssFeedUrl,
        new ParseConfiguration(
            titleField,
            categoriesField,
            descriptionField,
            authorField,
            imageLinkField,
            externalArticleLinkField,
            parsedAtField
        ),
        creatorUserId,
        approved
    )
  }

  public getFieldConfigurationForFormFields(
      field: FieldConfigurationCommand | null): FieldConfiguration | null {

    if (field) {

      if (field.configuration.type === "DynamicFieldConfigurationCommand") {

        let extractRegExp = null
        try {
          extractRegExp = field.configuration.extractRegExp ? new RegExp(field.configuration.extractRegExp) : undefined;
        } catch (e) {
          console.error(e)
        }

        return new DynamicFieldConfiguration(field.configuration.objectPath, extractRegExp ?? undefined)

      } else if (field.configuration.type === "StaticFieldConfigurationCommand") {

        if (field.configuration.value === null) {
          return null
        }

        let value: string | string[] = field.configuration.value
        if (field.configuration.value.includes(',')) {
          value = field.configuration.value.split(',').map(v => v.trim())
        }

        return new StaticFieldConfiguration(value)
      } else {
        return new UseExistingCategoryImageFromField(field.configuration.objectPath)
      }
    }

    return null
  }

}
