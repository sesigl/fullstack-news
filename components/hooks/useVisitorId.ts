import {useEffect, useState} from "react";
import {useVisitorData} from "@fingerprintjs/fingerprintjs-pro-react";
import axios from "axios";

function recordVisitorPageView(visitorId: string, requestId: string) {
  const queryString = `visitorId=${visitorId}&requestId=${requestId}`;
  axios.get(`/api/id?${queryString}`)
}

export default function useVisitorId() {
  const [visitorId, setVisitorId] = useState<{ id: string, requestId: string }>()

  const {
    data: visitorData,
  } = useVisitorData({extendedResult: false}, {immediate: true})

  useEffect(() => {
    if (visitorData?.visitorId) {
      setVisitorId({
        id: visitorData.visitorId,
        requestId: visitorData.requestId
      })

      recordVisitorPageView(visitorData.visitorId, visitorData.requestId);
    }

  }, [visitorData?.visitorId, visitorData?.requestId])

  return visitorId;
}