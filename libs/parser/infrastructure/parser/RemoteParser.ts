import Parser from "../../domain/articleSource/service/Parser";
import {CustomFeed} from "../../domain/articleSource/entity/CustomFeed";
import {CustomItem} from "../../domain/articleSource/entity/CustomItem";
import * as RSSParser from "rss-parser";
import {injectable} from "tsyringe";

@injectable()
export default class RemoteParser implements Parser {

  public static customFields: (keyof CustomItem)[] = [
    'dc:creator', 'media:thumbnail', 'media:content', 'isoDate'
  ]

  public static parser: RSSParser<CustomFeed, CustomItem> = new RSSParser.default({
    customFields: {
      item: RemoteParser.customFields,
    }
  });

  async parse(url: string): Promise<CustomFeed & RSSParser.Output<CustomItem>> {
    return await RemoteParser.parser.parseURL(url)
  }

}
