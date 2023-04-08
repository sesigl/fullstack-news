import Parser from "rss-parser";
import ContentParser from "../../domain/service/ContentParser";
import Article from "../../domain/entity/article/Article";
import {injectable} from "tsyringe";
import ArticleFactory from "../../domain/entity/article/ArticleFactory";
import {CustomFeed} from "../../domain/articleSource/entity/CustomFeed";
import {CustomItem} from "../../domain/articleSource/entity/CustomItem";
import categoryToImageUrlPath, {DEFAULT_IMAGE} from "../category/categoryToImageUrlPath";
import {staticAssetsBasePath} from "../../../configuration";

import {convert} from "html-to-text";


const url = "https://css-tricks.com/feed/"
const whiteListCategories = ['javascript', 'react', 'vue', 'performance', 'jamstack', 'serverless', 'images', 'flutter', 'server side rendering', 'web components']
export const removeCategories = ['article', 'global scope', 'framework']


const MAX_DESCRIPTION_LENGTH = 800;
@injectable()
export default class CssTricksParser implements ContentParser {

  constructor(private readonly articleFactory: ArticleFactory) {
  }

  async fetchAllArticles(): Promise<Article[]> {
    const parser: Parser<CustomFeed, CustomItem> = new Parser({
      customFields: {
        item: ['dc:creator', 'media:thumbnail'],
      }
    });

    const feed = await this.parseWith(parser);

    let articlePromises = feed.items
    .filter(item => item.categories.some(c => whiteListCategories.includes(c.toLowerCase())))
    .map(async (item) => {
      let authorInBracesMatchResult = item["dc:creator"]

      let tags = item.categories.map(c => c.toLowerCase()).filter(c => !removeCategories.includes(c));
      return (
          this.articleFactory.create({
            title: this.clean(item.title),
            tags: tags,
            mlTags: [],
            description: item['content:encoded'] ? this.cleanContent(item['content:encoded']?.trim()) : "",
            author: (authorInBracesMatchResult ? authorInBracesMatchResult : ""),
            link: this.clean(item.link),
            imageLink: await this.getCategoryImage(tags),
            parsedAt: new Date(Date.parse(item.isoDate)),
            articleSourceId: "articleSourceId"
          }));
    })
    const articles = (await Promise.all(articlePromises))
    .sort((item1, item2) => item2.parsedAt.getTime() - item1.parsedAt.getTime());

    return articles
  }

  async getCategoryImage(categories: string[]): Promise<string> {
    const allImages = await Promise.all(categories.map(c => categoryToImageUrlPath(c.toLowerCase(), 'CssTricksParser')))

    const categorySpecificImage = allImages.find(img => img !== DEFAULT_IMAGE)

    if (categorySpecificImage) {
      return categorySpecificImage
    } else {
      return allImages[0] ?? (staticAssetsBasePath + DEFAULT_IMAGE)
    }
  }

  private clean(title: string) {
    return title.replaceAll('\n', '').trim();
  }

  private cleanContent(text: string) {


    let cleanedText = convert(text, {
      limits: {
        maxInputLength: MAX_DESCRIPTION_LENGTH,
      },
      wordwrap: false,
      ignoreHref: true,
      ignoreImage: true,
      uppercaseHeadings: true,
    });

    cleanedText = cleanedText.replaceAll(/(\n)+([A-Z ]+\n\n)/g, "X")
    cleanedText = cleanedText.replaceAll(/(\n)+/g, "")

    const lastDotIndex = cleanedText.lastIndexOf(".")

    return cleanedText.slice(0, lastDotIndex + 1);
  }

  protected async parseWith(parser: Parser<CustomFeed, CustomItem>) {
    return await parser.parseURL(url);
  }

  hasGoodCategories(): boolean {
    return false;
  }
}
