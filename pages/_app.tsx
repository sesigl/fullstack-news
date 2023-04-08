import '../styles/globals.css'
import {AppProps} from "next/app";
import {CacheLocation, FpjsProvider} from "@fingerprintjs/fingerprintjs-pro-react";
import {UserProvider} from '@auth0/nextjs-auth0';
import {useEffect} from "react";
import {useRouter} from "next/router";
import NProgress from "nprogress"
import "./custom_nprogress.css"
import { Analytics } from '@vercel/analytics/react';

let progressBarTimeout: NodeJS.Timeout | undefined = undefined

const startProgressBar = () => {
  clearTimeout(progressBarTimeout)
  progressBarTimeout = setTimeout(NProgress.start, 300)
}

const stopProgressBar = () => {
  clearTimeout(progressBarTimeout)
  NProgress.done()
}

function MyApp({Component, pageProps}: AppProps) {

  const router = useRouter()

  useEffect(() => {
    NProgress.configure({ });

    const handleRouteStart = () => startProgressBar();
    const handleRouteDone = () => stopProgressBar();

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);

    return () => {
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [])

  return (
      <UserProvider>
        <FpjsProvider
            loadOptions={{
              apiKey: '_',
              region: "eu",
              endpoint: "https://metrics.fullstack-news.com"
            }}
            cacheLocation={CacheLocation.LocalStorage}
        >
          <Component {...pageProps} />
          <Analytics />
        </FpjsProvider>
      </UserProvider>
  )
}

export default MyApp
