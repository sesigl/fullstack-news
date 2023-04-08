import speakingUrl from "speakingurl";

export function getSlug(article: { title: string; id: string }) {
  return speakingUrl.createSlug({truncate: 50})(article.title);
}

export default function getArticlePageLink(article: { title: string, id: string }) {
  return '/articles/' + getSlug(article) + "/" + article.id;
}