import {ReactNode} from "react";
import './global.css';
import siteConfig from "../config/site.config";
import {getContentPage} from "../libs/getContentPage";
import Script from "next/script";
import {Roboto_Flex} from '@next/font/google';
import Navbar from "./Navbar";


const roboto = Roboto_Flex({
  subsets: ["latin"]
});

export default function RootLayout({
                                     children,
                                   }: {
  children: ReactNode,
}) {

  const {
    contact,
    newsletter,
    metaTitle,
    metaKeyword,
    metaAuthor,
    metaDescription,
    ogImage
  } = getStaticProps()

  return (
      <html lang="en" className={roboto.className}>
      <head>

        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#A90A16"/>
        <link
            rel="apple-touch-icon"
            sizes="192x192"
            href="/icons/maskable_icon_x192.png"
        />

        <link
            rel="shortcut icon"
            href={`https://www.fullstack-news.com/_next/image?url=${encodeURIComponent(siteConfig.favicon)}&w=640&q=75`}
            type="image/x-icon"
        />

        <meta charSet="utf-8"/>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge"/>
        <meta name="keyword" content={metaKeyword}/>
        <meta name="author" content={metaAuthor}/>

        <meta property="og:title" content={metaTitle}/>
        <meta property="og:image"
              content={`https://www.fullstack-news.com/_next/image?url=${encodeURIComponent(ogImage)}&w=640&q=75`}/>
        <meta name="twitter:title" content={metaTitle}/>
        <meta name="twitter:image"
              content={`https://www.fullstack-news.com/_next/image?url=${encodeURIComponent(ogImage)}&w=640&q=75`}/>
        <meta name="twitter:card" content="summary_large_image"/>

      </head>
      <body>

      <Navbar/>

      {children}
      </body>

      <Script
          type="text/javascript"
          src="https://app.termly.io/embed.min.js"
          data-auto-block="off"
          data-website-uuid="f7122f03-53a1-47bb-b60d-7436433e9172"
      ></Script>

      <Script defer data-api="/_hive" src="/bee.js"></Script>

      </html>
  );
}

function getStaticProps() {
  return {
    contact: getContentPage('content/pages/imprint.md'),
    newsletter: getContentPage('content/shared/newsletter.md'),
    metaTitle: siteConfig.metaData.title,
    metaDescription: siteConfig.metaData.description,
    metaAuthor: siteConfig.metaData.author,
    metaKeyword: siteConfig.metaData.keyword,
    ogImage: siteConfig.metaData.ogImage,
  };
}
