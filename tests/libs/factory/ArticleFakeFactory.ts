import ArticleFactory from "../../../libs/parser/domain/entity/article/ArticleFactory";
import Article from "../../../libs/parser/domain/entity/article/Article";
import {v4 as uuidv4} from "uuid";

export default class ArticleFakeFactory {

  getWithCategory(category: string): Article {
    return (new ArticleFactory()).create({
      title: "title",
      author: "author",
      description: "description",
      link: "http://localhost/" + uuidv4(),
      tags: [category],
      mlTags: [],
      parsedAt: new Date(),
      imageLink: "http://localhost/image",
      articleSourceId: 'articleSourceId'
    })
  }

  getOne(): Article {
    return (new ArticleFactory()).create({
      title: "title",
      author: "author",
      description: "description",
      link: "http://localhost/" + uuidv4(),
      tags: [],
      mlTags: [],
      parsedAt: new Date(),
      imageLink: "http://localhost/image",
      articleSourceId: 'articleSourceId'
    })
  }

}
