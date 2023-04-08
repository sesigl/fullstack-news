import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import siteConfig from '../../config/site.config';
import {ReactNode, useEffect} from "react";

import "reflect-metadata"
import useVisitorId from "../hooks/useVisitorId";
import splitbee from '@splitbee/web';
import ReactTooltip from "react-tooltip";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function Layout({
                                 metaTitle,
                                 metaDescription,
                                 metaAuthor,
                                 metaKeyword,
                                 ogImage,
                                 children,
                               }: {
  metaTitle: string,
  metaDescription: string,
  metaAuthor: string,
  metaKeyword: string,
  ogImage: string,
  children: ReactNode,
}) {
  // triggers visitor auth - DONT REMOVE
  useVisitorId()

  useEffect(() => {
    splitbee.init({
      scriptUrl: "/bee.js",
      apiUrl: "/_hive",
    })
  }, [])

  return (
      <>
        <Head>

          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script
              type="text/javascript"
              src="https://app.termly.io/embed.min.js"
              data-auto-block="off"
              data-website-uuid="f7122f03-53a1-47bb-b60d-7436433e9172"
              defer
          ></script>

          <script defer data-api="/_hive" src="/bee.js"></script>

          <title>{metaTitle}</title>

          <meta charSet="utf-8"/>
          <meta
              name="viewport"
              content="width=device-width, initial-scale=1, maximum-scale=5"
          />
          <meta httpEquiv="X-UA-Compatible" content="ie=edge"/>
          <meta name="keyword" content={metaKeyword}/>
          <meta name="author" content={metaAuthor}/>
          <meta name="description" content={metaDescription}/>

          <meta property="og:title" content={metaTitle}/>
          <meta property="og:description" content={metaDescription}/>
          <meta property="og:image" content={ogImage}/>
          <meta name="twitter:title" content={metaTitle}/>
          <meta name="twitter:image" content={ogImage}/>
          <meta name="twitter:card" content="summary_large_image"/>
          <meta name="twitter:description" content={metaDescription}/>

          <link
              rel="shortcut icon"
              href={`https://www.fullstack-news.com/_next/image?url=${encodeURIComponent(siteConfig.favicon)}&w=640&q=75`}
              type="image/x-icon"
          />

        </Head>

        <Navbar/>
        {children}

        <Footer/>
        <ReactTooltip />
        <ToastContainer />
      </>
  );
}

Layout.defaultProps = {
  metaTitle: siteConfig.metaData.title,
  metaDescription: siteConfig.metaData.description,
  metaAuthor: siteConfig.metaData.author,
  metaKeyword: siteConfig.metaData.keyword,
  ogImage: siteConfig.metaData.ogImage,
}
