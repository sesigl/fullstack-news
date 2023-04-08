import {useEffect} from "react";
import isProduction from "../../libs/parser/infrastructure/vercel/environment/isProduction"

export function GoogleAdsenseContainer({client, slot}: { client: string, slot: string }) {

  useEffect(() => {
    try {
      if (isProduction()) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  return (
      <div
          className={"m-auto overflow-hidden\t"}
      >
        <ins
            className="adsbygoogle"
            style={{display: "block"}}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>

      </div>
  );
}
