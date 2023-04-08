import * as RSSParser from "rss-parser";
import {CustomItem} from "../entity/CustomItem";
import {CustomFeed} from "../entity/CustomFeed";

export const PARSER_CUSTOM_FIELDS: RSSParser.CustomFieldItem<CustomItem>[] = ['media:content', 'dc:creator', 'media:thumbnail']

export default interface Parser {

  parse(url: String): Promise<CustomFeed & RSSParser.Output<CustomItem>>

}
