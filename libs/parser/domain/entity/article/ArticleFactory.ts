import Article from "./Article";
import {v4 as uuidv4} from "uuid";
import {singleton} from "tsyringe";
import Vote from "../vote/Vote";
import ArticleWithRelations from "./ArticleWithRelations";
import {CommentWithUserInformationReply} from "../../../application/CommentApplicationService";
import Challenge from "../../challenge/Challenge";

@singleton()
export default class ArticleFactory {

  create({title, description, author, link, imageLink, parsedAt, tags, mlTags, articleSourceId}: {
    title: string,
    description: string,
    author: string,
    link: string,
    imageLink: string,
    parsedAt: Date,
    tags: string[],
    mlTags: string[],
    articleSourceId: string,
  }) {

    return this.createFromExisting({
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          title,
          description,
          author,
          link,
          imageLink,
          parsedAt,
          tags,
          mlTags,
          articleSourceId,
    })

  }

  createFromExisting({
                       id,
                       title,
                       description,
                       author,
                       link,
                       imageLink,
                       parsedAt,
                       tags,
                       mlTags,
                       createdAt,
                       updatedAt,
                       articleSourceId,
                     }: {
    id: string,
    title: string,
    description: string,
    author: string,
    link: string,
    imageLink: string,
    parsedAt: Date,
    tags: string[],
    mlTags: string[],
    createdAt: Date,
    updatedAt: Date,
    articleSourceId: string
  }) {

    let finalTags = this.calculateArticleTags(tags, mlTags);

    return new Article(
        id,
        createdAt,
        updatedAt,
        title,
        description,
        author,
        link,
        imageLink,
        parsedAt,
        finalTags,
        articleSourceId
    )

  }

  private calculateArticleTags(tags: string[], mlTags: string[]) {
    let finalTags = tags

    if (mlTags.length > 0 && mlTags[0] !== 'other') {
      finalTags = mlTags
    }
    return finalTags;
  }

  createWithRelationsFromExisting({
                                    id,
                                    title,
                                    description,
                                    author,
                                    link,
                                    imageLink,
                                    parsedAt,
                                    tags,
                                    mlTags,
                                    createdAt,
                                    updatedAt,
                                    comments,
                                    votes,
                                    articleSourceId,
                                    challenges
                                  }: {
    id: string,
    title: string,
    description: string,
    author: string,
    link: string,
    imageLink: string,
    parsedAt: Date,
    tags: string[],
    mlTags: string[],
    createdAt: Date,
    updatedAt: Date
    comments: CommentWithUserInformationReply[]
    votes: Vote[],
    articleSourceId: string,
    challenges: Challenge[]
  }) {

    let finalTags = this.calculateArticleTags(tags, mlTags);

    return new ArticleWithRelations(
        id,
        createdAt,
        updatedAt,
        title,
        description,
        author,
        link,
        imageLink,
        parsedAt,
        finalTags,
        comments,
        votes,
        articleSourceId,
        challenges
    )

  }

}
