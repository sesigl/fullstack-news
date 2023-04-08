import splitbee from "@splitbee/web";
import isProduction from "../vercel/environment/isProduction";

export function trackEvent(eventName: string, data: Record<string, string>) {
  if (isProduction()) {
    return splitbee.track(eventName, data)
  } else {
    return Promise.resolve()
  }
}
