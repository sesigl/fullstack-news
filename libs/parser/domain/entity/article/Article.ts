export default class Article {

  constructor(
      public id: string,
      public createdAt: Date,
      public updatedAt: Date,
      public title: string,
      public description: string,
      public author: string,
      public link: string,
      public imageLink: string,
      public parsedAt: Date,
      public tags: string[],
      public articleSourceId: string
  ) {
  }

}
