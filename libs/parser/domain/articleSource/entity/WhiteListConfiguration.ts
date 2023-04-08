import Article from "../../entity/article/Article";

export default class WhiteListConfiguration {
  constructor(public field: keyof Article, public atLeastSingleValueMatch: string[]) {
  }
}
