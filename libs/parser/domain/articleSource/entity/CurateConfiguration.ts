import Article from "../../entity/article/Article";

export default class CurateConfiguration {
  constructor(public field: keyof Article, public removeValues: string[]) {
  }
}
