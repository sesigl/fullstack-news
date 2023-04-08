import ArticleSource from "../../../libs/parser/domain/articleSource/entity/ArticleSource";
import ParseConfiguration
  from "../../../libs/parser/domain/articleSource/entity/ParseConfiguration";
import DynamicFieldConfiguration
  from "../../../libs/parser/domain/articleSource/entity/fieldConfiguration/DynamicFieldConfiguration";

export default class ArticleSourceFakeFactory {

  getOne(rssUrl = "https://hackernoon.com/feed"): ArticleSource {
    return new ArticleSource(
        "id1",
        rssUrl,
        new ParseConfiguration(
            new DynamicFieldConfiguration('title'),
            new DynamicFieldConfiguration('categories'),
            new DynamicFieldConfiguration('content'),
            new DynamicFieldConfiguration("dc:creator"),
            new DynamicFieldConfiguration("media:thumbnail.$.url", /https:\/\/hackernoon\.com\/(.*)/),
            new DynamicFieldConfiguration("link"),
            new DynamicFieldConfiguration("isoDate"),
            [],
        ),
        "creatorUserId",
        false
    )
  }

}
