import ParseConfiguration from "./ParseConfiguration";
import Parser from "../service/Parser";
import * as RSSParser from "rss-parser";
import FieldConfiguration from "./fieldConfiguration/FieldConfiguration";
import DynamicFieldConfiguration from "./fieldConfiguration/DynamicFieldConfiguration";
import Article from "../../entity/article/Article";
import {CustomItem} from "./CustomItem";
import ArticleFactory from "../../entity/article/ArticleFactory";
import _ from "lodash";
import StaticFieldConfiguration from "./fieldConfiguration/StaticFieldConfiguration";
import UseExistingCategoryImageFromField
  from "./fieldConfiguration/UseExistingCategoryImageFromField";
import categoryToImageUrlPath, {
  DEFAULT_IMAGE
} from "../../../infrastructure/category/categoryToImageUrlPath";
import {staticAssetsBasePath} from "../../../../configuration";
import {convert} from "html-to-text";

const MAX_DESCRIPTION_LENGTH = 800;

export default class ArticleSource {

  constructor(public id: string,
              // must be unique
              public rssUrl: string, public parseConfiguration: ParseConfiguration, public creatorUserId: string, public approved: boolean) {
  }


  async parseWith(parser: Parser, articleFactory: ArticleFactory) {
    const feed = await parser.parse(this.rssUrl);

    return (await Promise.all(feed.items.map(async item => {

      let dateStr = await this.extractSingleValue('parsedAt', this.parseConfiguration.parsedAtField, item);
      let date = Date.parse(dateStr);
      return (
          articleFactory.create({
            title: await this.extractSingleValue('title', this.parseConfiguration.titleField, item),
            tags: this.applyTagSpecificTransformation(await this.extractArr('tags', this.parseConfiguration.categoriesField, item)),
            mlTags: [],
            description: await this.extractSingleValue('description', this.parseConfiguration.descriptionField, item),
            author: await this.extractSingleValue('author', this.parseConfiguration.authorField, item),
            link: await this.extractSingleValue('link', this.parseConfiguration.externalArticleLinkField, item),
            imageLink: await this.extractSingleValue('imageLink', this.parseConfiguration.imageLinkField, item),
            parsedAt: new Date(date),
            articleSourceId: this.id
          }));
    })))
    .filter((item) => this.keepItem(item))
    .map((item) => this.curateItem(item))
    .sort((item1, item2) => item2.parsedAt.getTime() - item1.parsedAt.getTime())
  }

  async extractSingleValue(articleField: keyof Article, fieldConfiguration: FieldConfiguration, item: CustomItem & RSSParser.Item): Promise<string> {
    const result = await this.extract(articleField, fieldConfiguration, item);

    if (result === undefined) {
      return ""
    }

    if (typeof result === "string") {
      return result
    } else {
      throw new Error("item is not a string, use the array method")
    }
  }

  async extractArr(articleField: keyof Article, fieldConfiguration: FieldConfiguration, item: CustomItem & RSSParser.Item): Promise<string[]> {
    const result = await this.extract(articleField, fieldConfiguration, item);

    if (result === undefined) {
      return []
    }

    if (this.isStringArray(result)) {
      return result
    } else {
      if (result.includes(',')) {
        return result.split(',').map(r => r.trim())
      } else {
        return [result]
      }
    }
  }

  async extract(articleField: keyof Article, fieldConfiguration: FieldConfiguration, item: CustomItem & RSSParser.Item): Promise<string | string[]> {
    if (fieldConfiguration instanceof DynamicFieldConfiguration) {
      return this.getValueForDynamicFieldConfiguration(item, fieldConfiguration);
    } else if (fieldConfiguration instanceof StaticFieldConfiguration) {
      return fieldConfiguration.value
    } else if (fieldConfiguration instanceof UseExistingCategoryImageFromField) {
      const dynamicValue = this.getValueForDynamicFieldConfiguration(item, fieldConfiguration);
      return await this.getFieldValueForUseExistingCategoryImageFromField(dynamicValue);
    } else {
      throw new Error("Not implemented yet")
    }
  }

  private async getFieldValueForUseExistingCategoryImageFromField(value: string | string[]) {
    return await this.getImagesForItemValue(value);
  }

  private async getImagesForItemValue(itemValue: string | string[]) {
    const allImages = []

    if (typeof itemValue === "string") {
      const image = await categoryToImageUrlPath(itemValue.toLowerCase(), 'ArticleSource')
      allImages.push(image)
    }

    if (this.isStringArray(itemValue)) {
      let imagePromises = itemValue.map(c => categoryToImageUrlPath(c.toLowerCase(), 'ArticleSource'));
      const images = await Promise.all(
          imagePromises
      )
      allImages.push(...images)
    }

    return this.getExistingImageOrFallbackToDefaultImage(allImages);
  }

  private getExistingImageOrFallbackToDefaultImage(allImages: any[]) {
    const categorySpecificImage = allImages.find(img => img !== staticAssetsBasePath + DEFAULT_IMAGE)

    if (categorySpecificImage) {
      return categorySpecificImage
    } else {
      return allImages[0] ?? (staticAssetsBasePath + DEFAULT_IMAGE)
    }
  }

  private getValueForDynamicFieldConfiguration(item: CustomItem & RSSParser.Item, fieldConfiguration: DynamicFieldConfiguration | UseExistingCategoryImageFromField) {
    let itemValue = _.get(item, fieldConfiguration.objectPath) as string | string[];

    if (typeof itemValue === "string") {
      itemValue = this.cleanAndCurateValue(itemValue, fieldConfiguration);
    }

    if (this.isStringArray(itemValue)) {
      itemValue = itemValue
      .filter(item => item !== "")
      .map(arrayItem => this.cleanAndCurateValue(arrayItem, fieldConfiguration))
    }

    return itemValue
  }

  private cleanAndCurateValue(itemValue: string, fieldConfiguration: DynamicFieldConfiguration | UseExistingCategoryImageFromField) {
    let result: string = itemValue
    if (fieldConfiguration instanceof DynamicFieldConfiguration && fieldConfiguration.extractRegExp) {
      const matchResult = itemValue.match(fieldConfiguration.extractRegExp)

      if (matchResult && matchResult[1]) {
        result = matchResult[1]
      }
    }

    result = result.replaceAll('\n', '').trim();
    result = this.beautifyText(result);
    result = result.replaceAll(/\[(.+?)]\(.+?\)/g, "$1")
    result = result.replaceAll(/(\n)+([A-Z ]+\n\n)/g, "X")
    result = result.replaceAll(/(\n)+/g, "")
    result = this.ifSentencesEnsureFullSentences(result);

    return result;
  }

  private ifSentencesEnsureFullSentences(result: string) {
    const lastDotIndex = result.lastIndexOf(". ")

    if (lastDotIndex !== -1) {
      result = result.slice(0, lastDotIndex + 1);
    }
    return result;
  }

  private beautifyText(result: string) {
    const beforeConsoleWarn = console.warn

    // @ts-ignore
    console.warn = () => {
    }
    result = convert(result, {
      limits: {
        maxInputLength: MAX_DESCRIPTION_LENGTH,
      },
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
      uppercaseHeadings: true,
    });

    console.warn = beforeConsoleWarn
    return result;
  }

  private isStringArray(x: string[] | string): x is string[] {
    return Array.isArray(x)
  }

  private keepItem(article: Article) {
    let keepItem = true
    this.parseConfiguration.whiteListConfigurations.forEach(whiteListConfiguration => {
      const value = article[whiteListConfiguration.field]

      if (Array.isArray(value)) {
        const whitelistCheck = (value as string[]).some(c => whiteListConfiguration.atLeastSingleValueMatch.includes(c.toLowerCase()))

        if (!whitelistCheck) {
          keepItem = false
        }

      }
    })

    if (article.description === "" || article.title === "" || article.author === "" || article.link === "" || article.imageLink === "") {
      keepItem = false
    }

    return keepItem
  }

  private curateItem(item: Article): Article {
    this.parseConfiguration.curateConfigurations.forEach(curateConfiguration => {
      const value = item[curateConfiguration.field]

      if (Array.isArray(value)) {
        // @ts-ignore
        item[curateConfiguration.field] = (item[curateConfiguration.field] as string[])
        .map(c => c.toLowerCase())
        .filter(c => !curateConfiguration.removeValues.includes(c));
      }
    })

    return item
  }

  private applyTagSpecificTransformation(tags: string[]) {
    return tags.map(t => t.replaceAll(' ', '-'))
  }
}
