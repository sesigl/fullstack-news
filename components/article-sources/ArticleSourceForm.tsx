import {useForm} from "react-hook-form";
import {ErrorMessage} from '@hookform/error-message';
import validator from "validator";
import {useEffect, useState} from "react";
import Link from "next/link";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import Image from "next/image";
import {formatDate} from "../../utils/formatDate";
import hash from "object-hash";
import objectHash from "object-hash";
import {concat, flatMap, isArray, isPlainObject, keys, map} from "lodash";
import {
  CreateArticleSourceCommand
} from "../../libs/interfaces/commands/CreateArticleSourceCommand";
import {useRouter} from "next/router";
import {NotificationProps} from "../profile/Notification";
import Notification from "./Notification";
import {
  ArticleSourceViewModel
} from "../../libs/interfaces/viewModels/ArticleSourceOverviewViewModel";
import {RssFeedKeysWithExamplesViewModel} from "../../pages/api/parseRssItemFields";
import UserViewModel from "../../libs/interfaces/viewModels/UserViewModel";
import Post from "../../libs/interfaces/viewModels/Post";

interface DynamicFieldConfigurationCommand {
  type: "DynamicFieldConfigurationCommand",
  objectPath: string,
  extractRegExp: string | undefined
}

// | "StaticFieldConfiguration" | "UseExistingCategoryImageFromField",
interface StaticFieldConfigurationCommand {
  type: "StaticFieldConfigurationCommand"
  value: string | undefined,
}

interface UseExistingCategoryImageFromFieldCommand {
  type: "UseExistingCategoryImageFromFieldCommand"
  objectPath: string,
}


const parseLabels: Record<(keyof CreateArticleSourceCommand['parseConfiguration']), string> = {
  authorField: "Author",
  categoriesField: "Category",
  descriptionField: "Description",
  externalArticleLinkField: "External Links",
  imageLinkField: "Image",
  parsedAtField: "Parsed At",
  titleField: "Title"
}

const parseDescriptions: Record<(keyof CreateArticleSourceCommand['parseConfiguration']), string> = {
  authorField: "Description Author",
  categoriesField: "Description Category",
  descriptionField: "Description Description",
  externalArticleLinkField: "Description External Links",
  imageLinkField: "Description Image",
  parsedAtField: "Description Parsed At",
  titleField: "Description Title"
}

let formFields: CreateArticleSourceCommand = {
  id: null,
  rssFeedUrl: null,
  parseConfiguration: {
    titleField: null,
    categoriesField: null,
    descriptionField: null,
    authorField: null,
    externalArticleLinkField: null,
    imageLinkField: null,
    parsedAtField: null,
  },
}



export function getPaths(obj: any, parentKey?: string): string[] {
  var result: string[];
  if (isArray(obj)) {
    var idx = 0;
    result = flatMap(obj, function(obj: any) {
      return getPaths(obj, (parentKey || '') + '[' + idx++ + ']');
    });
  } else if (isPlainObject(obj)) {
    result = flatMap(keys(obj), function(key) {
      return map(getPaths(obj[key], key), function(subkey) {
        return (parentKey ? parentKey + '.' : '') + subkey;
      });
    });
  } else {
    result = [];
  }
  return concat(result, parentKey || []);
}

function useRssParserConfigurationForm(articleSourceViewModel?: ArticleSourceViewModel) {
  const [rssItemKeys, setRssItemKeys] = useState<string[]>([])
  const [rssItemExampleValues, setRssItemExampleValues] = useState<string[]>([])
  const [previewPosts, setPreviewPosts] = useState<Post[]>([])
  const [isValid, setIsValid] = useState<boolean>(false)

  const fieldDefault: DynamicFieldConfigurationCommand = {
    type: "DynamicFieldConfigurationCommand",
    objectPath: "",
    extractRegExp: ""
  }

  let defaultParseConfiguration = {
    authorField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.authorField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    },
    categoriesField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.categoriesField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    },
    descriptionField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.descriptionField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    },
    externalArticleLinkField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.externalArticleLinkField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    },
    imageLinkField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.imageLinkField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    },
    parsedAtField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.parsedAtField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    },
    titleField: {
      configuration: articleSourceViewModel ? articleSourceViewModel.parseConfiguration.titleField?.configuration : {
        ...fieldDefault,
        objectPath: "empty"
      }
    }
  };

  const {register, handleSubmit, watch, setValue, formState: {errors}} = useForm<CreateArticleSourceCommand>({
    defaultValues: {
      rssFeedUrl: articleSourceViewModel ? articleSourceViewModel.rssFeedUrl : undefined,
      parseConfiguration: defaultParseConfiguration,
    }
  });

  useEffect(() => {
      Object.entries(defaultParseConfiguration).forEach((entry) => {
        let configuration = entry[1].configuration;

        if (configuration) {

          if (configuration.type === "DynamicFieldConfigurationCommand") {
            // @ts-ignore
            setValue(`parseConfiguration.${entry[0]}.configuration.objectPath`, configuration.objectPath);
            // @ts-ignore
            setValue(`parseConfiguration.${entry[0]}.configuration.extractRegExp`, configuration.extractRegExp);
          } else if (configuration.type === "StaticFieldConfigurationCommand") {
            // @ts-ignore
            setValue(`parseConfiguration.${entry[0]}.configuration.value`, configuration.value);
          } else if (configuration.type === "UseExistingCategoryImageFromFieldCommand") {
            // @ts-ignore
            setValue(`parseConfiguration.${entry[0]}.configuration.objectPath`, configuration.objectPath);
          }

        }

      })

  }, [objectHash(rssItemKeys)])

  const watchAllFields = watch();


  useEffect(() => {

    let containsAllValues = true
    const entries = Object.entries(watchAllFields.parseConfiguration)

    entries.forEach(entry => {
      if (entry[1]?.configuration.type === "StaticFieldConfigurationCommand") {
        if (entry[1]?.configuration.value === null ||  entry[1]?.configuration.value === undefined) {
          containsAllValues = false
        }
      } else {
        if (!entry[1]?.configuration.objectPath || entry[1]?.configuration.objectPath === "empty") {
          containsAllValues = false
        }
      }
    })

    const fetchArticles = async () => {

      if ((!containsAllValues || rssItemKeys.length === 0) && watchAllFields.rssFeedUrl) {

        const rssFeedKeysWithExamplesViewModel: RssFeedKeysWithExamplesViewModel = await (await fetch("/api/parseRssItemFields", {
          credentials: 'include',
          method: 'POST',
          body: JSON.stringify({rssFeedUrl: watchAllFields.rssFeedUrl}),
          headers: {
            'Content-Type': 'application/json'
          },
        })).json()


        if (Object.values(rssFeedKeysWithExamplesViewModel)[0]) {
          setRssItemKeys(rssFeedKeysWithExamplesViewModel.data.map(entry => (entry.key)))
          setRssItemExampleValues(rssFeedKeysWithExamplesViewModel.data.map(entry => (entry.exampleValue)))
        }
      }
      console.log('containsAllValues', containsAllValues)
      console.log('watchAllFields.rssFeedUrl', watchAllFields.rssFeedUrl)

      if (containsAllValues && watchAllFields.rssFeedUrl) {
        const posts = await (await fetch("/api/parseArticleSource", {
          credentials: 'include',
          method: articleSourceViewModel ? 'PUT' : 'POST',
          body: JSON.stringify({...watchAllFields}),
          headers: {
            'Content-Type': 'application/json'
          },
        })).json() as Post[]

        setPreviewPosts(posts)
          setIsValid(true)
        } else {
          setIsValid(false)
        }


    }

    fetchArticles()

  }, [objectHash(watchAllFields)])
  return {
    rssItemKeys,
    rssItemExampleValues,
    previewPosts,
    register,
    handleSubmit,
    errors,
    watchAllFields,
    isValid
  };
}

function PreviewArticle({
                          post,
                        }: { post: Post}) {
  return (
      <article className="relative lg:w-1/2 py-5">

        {/* Image */}
        <Link
            href={`${post.frontmatter.articlePageLink}`}
            className="relative z-10 block overflow-hidden bg-gray-100 rounded-2xl aspect-w-16 aspect-h-9 group"
            onClick={() => {
              trackEvent("Article Click", {
            href: post.frontmatter.link
          })
        }}>

        <img
          className="object-cover object-center transition duration-300 ease-in-out rounded-2xl group-hover:scale-110"
          src={post.frontmatter.image}
          alt={post.frontmatter.title}
          sizes="100vw" />

      </Link>

      {/* Content */}
      <div className="mt-6 md:align-middle">
        {post.frontmatter.category && <Link
          href={`/categories/${post.frontmatter.category.replace(/ /g, '-').toLowerCase()}`}
          className="relative text-sm font-medium tracking-widest text-red-700 uppercase duration-300 ease-in-out transition-color hover:text-red-600">

          {post.frontmatter.category}

        </Link>
        }
        <Link
          href={`${post.frontmatter.articlePageLink}`}
          target="articlePageLink"
          className="block mt-3 group"
          onClick={() => {
            trackEvent("Article Click", {
              href: post.frontmatter.link
            })
          }}>

          <h2 className="text-3xl font-medium tracking-normal text-gray-900 transition duration-300 ease-in-out decoration-gray-800 decoration-3 group-hover:underline md:tracking-tight lg:leading-tight lg:text-4xl">
            {post.frontmatter.title}
          </h2>
          <h3 className="text-sm text-gray-500 tracking-normal transition duration-300 ease-in-out decoration-gray-800 decoration-3 md:tracking-tight lg:leading-tight lg:sm">
            {post.frontmatter.baseLink}
          </h3>
          <div>
            <p className="mt-4 text-base leading-loose text-gray-600">
              {post.frontmatter.description}
            </p>
          </div>

        </Link>

        {/* Author */}
        <div className="flex items-center mt-4 sm:mt-8">

          <div className="">
                          <span className="text-sm font-medium text-gray-800">
                            {post.frontmatter.author}
                          </span>
            <p className="text-sm text-gray-500">
              <span>{formatDate(post.frontmatter.date)}</span>
              <span aria-hidden="true"> · </span>
              <span> {post.frontmatter.time_to_read_in_minutes} min read </span>
            </p>
          </div>
        </div>

      </div>

    </article>
  );
}

export default function ArticleSourceForm({
                                            user,
                                            articleSource
                                          }: { user: UserViewModel, articleSource?: ArticleSourceViewModel}) {

  const [notification, setNotification] = useState<NotificationProps | undefined>(undefined)

  function showNotification(notification?: NotificationProps) {
    setNotification(notification)
  }


  const router = useRouter()

  const onSubmit = async (data: CreateArticleSourceCommand) => {
    const result = await fetch("/api/addArticleSource", {
      credentials: 'include',
      method: articleSource ? 'PUT' : 'POST',
      body: JSON.stringify(articleSource ? {...data, id: articleSource.id} : data),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (result.status === 201) {
      trackEvent("Article source saved", {userId: user.id})
      .catch(console.error)

      router.push("/article-sources?success=" + data.rssFeedUrl)
    } else {
      showNotification({
        type: "error",
        message: "Something went wrong",
        subMessage: "Make sure all values are correctly configured. Check the preview below to identify misconfigured values. If you can not make it work, wait some time and try again or get in contact with us."
      })
    }

  }

  const {
    rssItemKeys,
    rssItemExampleValues,
    previewPosts,
    register,
    errors,
    watchAllFields,
    isValid,
    handleSubmit
  } = useRssParserConfigurationForm(articleSource);

  const inputClassName = "appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white duration-300 ease-in-out rounded py-3 px-4 read-only:text-gray-500"
  const infoClassName = "text-grey-dark text-xs italic p-1 text-gray-500"
  const errorClassName = "text-red-500 text-xs italic p-1"

  return (
      <div className="flex">
        {/* Content */}
        <div className="relative flex flex-col flex-wrap mt-6">
          <div
              className={`box-border flex flex-col justify-between flex-1 w-full md:px-0`}>
            <div>
              <form className="flex flex-col items-start" onSubmit={handleSubmit(onSubmit)}>

                <div className="bg-white rounded flex flex-col my-2">
                  <div className="-mx-3 md:flex mb-6">
                    <div className="md:w-1/2 px-3 mb-6 md:mb-0">
                      <label
                          className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                          htmlFor="grid-display-name">
                        RSS Feed Url
                      </label>
                      <input
                          className={inputClassName}
                          {...register("rssFeedUrl", {
                            required: true,
                            minLength: {
                              value: 3, message: "Rss Feed Url is too short"
                            },
                            validate: {
                              isUrl: (value) =>
                                  value && validator.isURL(value) || "Rss Feed Url is not a valid url",
                            },
                            value: ""
                          })} type="text"/>
                      <p className={infoClassName}>Provide the RSS Feed url, which contains latest
                        article of your article source.</p>
                      <ErrorMessage errors={errors} name="rssFeedUrl"
                                    render={({message}) => <p
                                        className={errorClassName}>{message}</p>}/>

                    </div>
                  </div>
                  <div className="-mx-3 mb-6 flex flex-col">
                    {formFields.parseConfiguration && Object.entries(formFields.parseConfiguration).map(entry => {
                      // @ts-ignore
                      const entryType = watchAllFields.parseConfiguration ? watchAllFields.parseConfiguration[entry[0]].configuration.type : undefined
                      // @ts-ignore
                      return <div key={entry[0] + JSON.stringify(entry[1])} className="flex flex-col lg:flex-row my-8 lg:my-4">
                        {
                          <div className="px-3 mb-6 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                                htmlFor="grid-display-name">
                              {parseLabels[(entry[0] as keyof CreateArticleSourceCommand['parseConfiguration'])]}
                            </label>
                            <select
                                className={inputClassName}
                                {...register(`parseConfiguration.${entry[0]}.configuration.type` as any, {
                                  required: true,
                                  value: "DynamicFieldConfigurationCommand"
                                })}>
                              <option value="DynamicFieldConfigurationCommand">Select from feed
                                item
                              </option>
                              <option value="StaticFieldConfigurationCommand">Static</option>
                              <option value="UseExistingCategoryImageFromFieldCommand">Select image
                                for feed item
                              </option>
                            </select>
                            <p className={infoClassName}>{parseDescriptions[(entry[0] as keyof CreateArticleSourceCommand['parseConfiguration'])]}</p>
                            <ErrorMessage errors={errors} name="rssFeedUrl"
                                          render={({message}) => <p
                                              className={errorClassName}>{message}</p>}/>

                          </div>
                        }

                        {
                          entryType === "DynamicFieldConfigurationCommand" ?
                              <>
                                <div className="px-3 mb-6 md:mb-0 flex-1">
                                  <label
                                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                                      htmlFor="grid-display-name">
                                    Dynamic Object Path
                                  </label>

                                  <select
                                      className={inputClassName}
                                      {...register(`parseConfiguration.${entry[0]}.configuration.objectPath` as any, {
                                        required: true,
                                      })}>
                                    <option value={"empty"}>- Not Selected -</option>
                                    {
                                      rssItemKeys.map((rssItemKey, index) => (
                                          <option value={rssItemKey} key={rssItemKey}>{rssItemKey} ({rssItemExampleValues[index]})</option>
                                      ))
                                    }
                                  </select>
                                  <p className={infoClassName}>Select available object path</p>
                                  <ErrorMessage errors={errors}
                                                name={`parseConfiguration.${entry[0]}.configuration.objectPath`}
                                                render={({message}) => <p
                                                    className={errorClassName}>{message}</p>}/>

                                </div>

                                <div className="px-3 mb-6 md:mb-0 flex-1">
                                  <label
                                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                                      htmlFor="grid-display-name">
                                    Regular expression to extract content (optional)
                                  </label>
                                  <input
                                      className={inputClassName}
                                      {
                                    //@ts-ignore
                                    ...register(`parseConfiguration.${entry[0]}.configuration.extractRegExp`, {
                                        required: false,
                                        value: ""
                                      })} type="text"/>
                                  <p className={infoClassName}>Dynamic content sometimes need to be cleaned. You can write a regular expression like &quot;\((.*)\)&quot; to extract content.</p>
                                  <ErrorMessage errors={errors}
                                                name={`parseConfiguration.${entry[0]}.configuration.extractRegExp`}
                                                render={({message}) => <p
                                                    className={errorClassName}>{message}</p>}/>

                                </div>

                              </> : <></>
                        }

                        {
                          entryType === "StaticFieldConfigurationCommand" ?
                              <div className="px-3 mb-6 md:mb-0">
                                <label
                                    className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                                    htmlFor="grid-display-name">
                                  Static values
                                </label>
                                <input
                                    className={inputClassName}
                                    {
                                  //@ts-ignore
                                  ...register(`parseConfiguration.${entry[0]}.configuration.value`, {
                                      minLength: {
                                        value: 3, message: "value is too short"
                                      },
                                      value: ""
                                    })} type="text"/>
                                <p className={infoClassName}>Provide a single value or multiple
                                  values separated by comma, e. g. &quot;React, NodeJS&quot;</p>
                                <ErrorMessage errors={errors}
                                              name={`parseConfiguration.${entry[0]}.configuration.value`}
                                              render={({message}) => <p
                                                  className={errorClassName}>{message}</p>}/>

                              </div> : <></>
                        }

                        {
                          entryType === "UseExistingCategoryImageFromFieldCommand" ?
                              <div className="px-3 mb-6 md:mb-0 flex-1">
                                <label
                                    className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                                    htmlFor="grid-display-name">
                                  Object Path for category images
                                </label>

                                <select
                                    className={inputClassName}
                                    {...register(`parseConfiguration.${entry[0]}.configuration.objectPath` as any, {
                                      required: true,
                                    })}>
                                  <option value={"empty"}>- Not Selected -</option>
                                  {
                                    rssItemKeys.map((rssItemKey, index) => (
                                        <option value={rssItemKey} key={rssItemKey}>{rssItemKey} ({rssItemExampleValues[index]})</option>
                                    ))
                                  }
                                </select>

                                <p className={infoClassName}>Provide object path that is used for to
                                  select a fitting category image as article image</p>
                                <ErrorMessage errors={errors}
                                              name={`parseConfiguration.${entry[0]}.configuration.objectPath`}
                                              render={({message}) => <p
                                                  className={errorClassName}>{message}</p>}/>

                              </div> : <></>
                        }
                      </div>

                    })}

                  </div>
                </div>

                <input type="submit" value="Save"
                       className={"text-white py-1.5 px-6 rounded cursor-pointer " +(isValid ? "bg-red-700 hover:bg-red-800":"bg-neutral-400")}/>

              </form>

              <Notification notification={notification}/>

              {
                previewPosts.length > 0 && <>
                    <h3 className="mt-10 text-2xl font-medium tracking-normal text-gray-900 md:tracking-tight lg:leading-tight md:text-3xl">
                      Preview
                    </h3>

                    {previewPosts.map((post) => (
                        <PreviewArticle post={post} key={hash(post)}/>
                    ))}
                  </>
              }

            </div>
          </div>
        </div>
      </div>
  )
}
