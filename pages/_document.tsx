import {Head, Html, Main, NextScript} from 'next/document'

export default function Document() {
  return (
      <Html>
        <Head>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}

          <link
              href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400&display=swap"
              rel="stylesheet"
          />
          <link rel="manifest" href="/manifest.json"/>
          <meta name="theme-color" content="#A90A16"/>
          <link
              rel="apple-touch-icon"
              sizes="192x192"
              href="/icons/maskable_icon_x192.png"
          />
        </Head>

        <body>
        <Main/>
        <NextScript/>
        </body>
      </Html>
  )
}
