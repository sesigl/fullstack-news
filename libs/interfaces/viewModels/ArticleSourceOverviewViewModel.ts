import ArticleSource from "../../parser/domain/articleSource/entity/ArticleSource";
import Article from "../../parser/domain/entity/article/Article";
import {CreateArticleSourceCommand} from "../commands/CreateArticleSourceCommand";
import DynamicFieldConfiguration
  from "../../parser/domain/articleSource/entity/fieldConfiguration/DynamicFieldConfiguration";
import StaticFieldConfiguration
  from "../../parser/domain/articleSource/entity/fieldConfiguration/StaticFieldConfiguration";
import UseExistingCategoryImageFromField
  from "../../parser/domain/articleSource/entity/fieldConfiguration/UseExistingCategoryImageFromField";
import FieldConfiguration
  from "../../parser/domain/articleSource/entity/fieldConfiguration/FieldConfiguration";
import FieldConfigurationCommand from "../commands/FieldConfiguartionCommand";

export default interface ArticleSourceOverviewViewModel {
  id: string,
  rssUrl: string,
  creatorUserId: string,
  articleCount: number,
  lastArticleParsedDate: string | null,
  approved: boolean,
}

export interface ArticleSourceViewModel extends CreateArticleSourceCommand {
  id: string
}

export function toArticleSourceViewModel(articleSource: ArticleSource): ArticleSourceViewModel {

  return {
    id: articleSource.id,
    rssFeedUrl: articleSource.rssUrl,
    parseConfiguration: {
      titleField: getConfiguration(articleSource.parseConfiguration.titleField),
      authorField: getConfiguration(articleSource.parseConfiguration.authorField),
      parsedAtField: getConfiguration(articleSource.parseConfiguration.parsedAtField),
      externalArticleLinkField: getConfiguration(articleSource.parseConfiguration.externalArticleLinkField),
      descriptionField: getConfiguration(articleSource.parseConfiguration.descriptionField),
      categoriesField: getConfiguration(articleSource.parseConfiguration.categoriesField),
      imageLinkField: getConfiguration(articleSource.parseConfiguration.imageLinkField),
    }
  }
}

function getConfiguration(fieldConfiguration: FieldConfiguration): FieldConfigurationCommand {
  if (fieldConfiguration instanceof DynamicFieldConfiguration) {
    return {
      configuration: {
        type: "DynamicFieldConfigurationCommand",
        objectPath: fieldConfiguration.objectPath,
        extractRegExp: fieldConfiguration.extractRegExp?.source ?? null
      }
    }
  } else if (fieldConfiguration instanceof StaticFieldConfiguration) {
    return {
      configuration: {
        type: "StaticFieldConfigurationCommand",
        value: Array.isArray(fieldConfiguration.value) ? fieldConfiguration.value.join(",") : fieldConfiguration.value,
      }
    }
  } else if (fieldConfiguration instanceof UseExistingCategoryImageFromField) {
    return {
      configuration: {
        type: "UseExistingCategoryImageFromFieldCommand",
        objectPath: fieldConfiguration.objectPath,
      }
    }
  }

  throw new Error("Not implemented for " + fieldConfiguration.constructor.name)
}


export function toArticleSourceOverviewViewModel(articleSource: ArticleSource, articles: Article[]): ArticleSourceOverviewViewModel {

  let articlesFromSource = articles.filter(a => a.articleSourceId === articleSource.id);
  const articleCount = articlesFromSource.length

  return {
    id: articleSource.id,
    rssUrl: articleSource.rssUrl,
    creatorUserId: articleSource.creatorUserId,
    articleCount: articleCount,
    lastArticleParsedDate: articlesFromSource[0] ? articlesFromSource[0].createdAt.toISOString() : null,
    approved: articleSource.approved
  }
}
