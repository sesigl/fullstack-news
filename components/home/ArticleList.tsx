import FeaturedArticles from "./FeaturedArticles";
import Topics from "./Topics";
import TwoColFeed from "./TwoColFeed";
import SidebarArticles from "../sidebar/SidebarArticles";
import SidebarSocialLinks from "../sidebar/SidebarSocialLinks";
import BannerArticle from "../shared/BannerArticle";
import SingleColFeed from "../shared/SingleColFeed";
import SidebarAd from "../sidebar/SidebarAd";
import {CategoryViewModel} from "../../libs/getCategories";
import React from "react";
import Post from "../../libs/interfaces/viewModels/Post";

interface ArticleListProps { postsWithChallenge: Post[], allPostsUpdated: Post[], categories: CategoryViewModel[] }

function ArticleList({postsWithChallenge, allPostsUpdated, categories}: ArticleListProps) {

  allPostsUpdated = allPostsUpdated ?? []
  categories = categories ?? []

  const topPosts = allPostsUpdated.slice(0, 7)
  const feedPosts = allPostsUpdated.slice(7, 13)
  const bannerPost = allPostsUpdated[allPostsUpdated.length - 1]
  const feed2Posts = allPostsUpdated.slice(13, 21)

  const sidebarPosts = postsWithChallenge.slice(0, 3)

  return <>
    <FeaturedArticles featuredPosts={topPosts}/>
    <Topics categories={categories}/>

    {/* Feed */}
    <section className="relative max-w-screen-xl py-12 mx-auto md:py-16 lg:py-20 lg:px-8">
      <div className="w-full lg:grid lg:gap-8 lg:grid-cols-3">
        <TwoColFeed posts={feedPosts}/>

        {/* Sidebar */}
        <div
            className="w-full max-w-xl px-4 mx-auto mt-12 space-y-8 sm:mt-16 lg:mt-0 md:max-w-3xl sm:px-6 md:px-8 lg:px-0 lg:col-span-1 lg:max-w-none">

          <SidebarArticles posts={sidebarPosts} header="Articles With Challenges"/>
          {/*<SidebarTags tags={tags.slice(0, 10)} header="Popular tags"/>*/}
          <SidebarSocialLinks/>
        </div>

      </div>
    </section>

    {bannerPost &&
        <BannerArticle post={bannerPost}/>}

    {/* Feed 2 */}
    <section
        className="relative max-w-xl px-4 py-12 mx-auto lg:max-w-screen-xl sm:py-16 lg:py-24 sm:px-12 md:max-w-3xl lg:px-8">
      <div className="w-full lg:grid lg:gap-8 xl:gap-12 lg:grid-cols-3">

        <div className="col-span-2">
          <SingleColFeed posts={feed2Posts}/>
        </div>

        {/* Sidebar */}
        <div className="w-full mt-12 space-y-8 sm:mt-16 lg:mt-0 lg:col-span-1">
          <SidebarAd/>
          {/*
                    <SidebarArticles posts={popularPosts} header="Most read"/>
                */}
        </div>

      </div>
    </section>
  </>

}

export default ArticleList;
