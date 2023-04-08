import React, {useState} from "react";
import AlgoliaSearchDataClient, {
  AlgoliaArticle
} from "../../libs/parser/infrastructure/algolia/AlgoliaSearchDataClient";
import {SearchIcon} from "@heroicons/react/solid";
import AutoSuggest from "react-autosuggest";
import CommentButton from "../buttons/CommentButton";
import UpVoteButton from "../buttons/UpVoteButton";
import Link from "next/link";
import {useRouter} from "next/router";
import getArticlePageLink
  , {getSlug} from "../../libs/parser/domain/entity/article/functions/getArticlePageLink";
import {Hit} from "@algolia/client-search";
import debounce from "debounce";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";

const theme = {
  // container: 'react-autosuggest__container',
  // containerOpen: 'react-autosuggest__container--open',
  // input: 'react-autosuggest__input',
  // inputOpen: 'react-autosuggest__input--open',
  // inputFocused: 'react-autosuggest__input--focused',
  suggestionsContainer: '',
  suggestionsContainerOpen: 'top-100 mt-1 w-full border bg-white shadow-xl rounded p-3 ',
  suggestionsList: 'divide-y ',
  suggestion: 'algolia_suggestion p-2 flex flex-col items-start block w-full rounded hover:bg-gray-100',
  // suggestionFirst: 'react-autosuggest__suggestion--first',
  suggestionHighlighted: 'bg-gray-100',
  // sectionContainer: 'react-autosuggest__section-container',
  // sectionContainerFirst: 'react-autosuggest__section-container--first',
  // sectionTitle: 'react-autosuggest__section-title'
  // input: 'w-full h-12 border border-slate-300 py-2 pl-10',
  // listbox: 'w-full bg-white sm:border sm:border-blue-300 sm:rounded text-left sm:mt-2 p-2 sm:drop-shadow-xl',
  // groupHeading: 'cursor-default mt-2 mb-0.5 px-1.5 uppercase text-sm text-rose-300',

}

const algoliaSearchDataClient = new AlgoliaSearchDataClient()

const debounceTrackSearchTextChange = debounce(function trackSearchTextChange(value: string) {
  trackEvent("Search", {value})
}, 250)

export default function AlgoliaSearch() {
  const router = useRouter();

  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Hit<AlgoliaArticle>[]>([]);

  async function getSuggestions(value: string) {
    return await algoliaSearchDataClient.search(value)
  }

  function TitleComponent(props: { hit: Hit<AlgoliaArticle> }) {
    const title = props.hit._highlightResult?.title?.value ?? ""

    const matchResult = title.match(/<em>(.+?)<\/em>/g)
    if (matchResult && matchResult[0]) {
      const titleSplit = title.split(/<em>(.+?)<\/em>/g)
      return (
        <span>{titleSplit[0]}<b
            className="text-red-800">{matchResult[0].replaceAll(/<\/?em>/g, '')}</b>{titleSplit[2]}</span>
      );
    }

    return <span>{title}</span>
  }


  function trackArticleClick(articlePageLink: string) {
    return trackEvent("Search selected", {searchValue: value, articlePageLink});
  }

  return <>
    <div className="relative w-full h-10 ml-6 max-w-xxs rounded-3xl z-20">
      <form className="transition duration-300 ease-in-out rounded-3xl group">
        <div className="absolute inset-y-0 flex items-center left-3">
          <SearchIcon className="w-5 h-5 text-gray-400"/>
        </div>
        <AutoSuggest
            shouldRenderSuggestions={() => true}
            alwaysRenderSuggestions={true}
            theme={theme}
            suggestions={suggestions}
            onSuggestionsClearRequested={() => setSuggestions([])}
            onSuggestionsFetchRequested={({value}) => {
              debounceTrackSearchTextChange(value);
              getSuggestions(value).then((res) => {
                return setSuggestions(res.hits.slice(0, 5))
              })
            }}
            onSuggestionSelected={(event, data) => {
              if (data.method === "enter") {
                let articlePageLink = getArticlePageLink({
                  title: data.suggestion.title,
                  id: data.suggestion.objectID
                });
                trackArticleClick(articlePageLink)
                router.push(articlePageLink)
              }
            }
            }
            getSuggestionValue={suggestion => suggestion.title}
            renderSuggestion={suggestion => {
              const articleLink = '/articles/' + getSlug({id: suggestion.objectID, title: suggestion.title}) + "/" + suggestion.objectID

              return <>
                <Link
                  href={articleLink}
                  onClick={() => trackArticleClick(articleLink)}>
                  <TitleComponent hit={suggestion}/>
                  <div className={"flex flex-row"}>
                    <CommentButton
                        disabled={true}
                        post={{
                          frontmatter: {
                            commentCount: suggestion.commentCount,
                            articlePageLink: ('/articles/' + getSlug({id: suggestion.objectID, title: suggestion.title}) + "/" + suggestion.objectID) ?? "/"
                          }
                        }}/>
                    <UpVoteButton
                        disabled={true}
                        post={({
                          id: suggestion.objectID,
                          frontmatter: {articlePageLink: ('/articles/' + getSlug({id: suggestion.objectID, title: suggestion.title}) + "/" + suggestion.objectID) ?? "/"}
                        })}
                        upVoteCount={suggestion.voteCount}
                        hasVotedSSR={false}
                    />
                  </div>

                </Link>
              </>;
            }}
            inputProps={{
              placeholder: "Search...",
              value: value,
              className: "w-full h-10 px-10 py-3 text-sm leading-5 text-gray-800 transition duration-300 ease-in-out bg-white border border-gray-200 hover:bg-gray-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-gray-50",
              onChange: (_, {newValue}) => {
                setValue(newValue);
              },
              onSelect: () => {
                return false;
              }
            }}
            highlightFirstSuggestion={true}
        />
      </form>
    </div>
  </>;
}
