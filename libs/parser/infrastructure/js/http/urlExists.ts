import {IncomingMessage} from "http";

const http = require('http');

export default function urlExists(urlStr: string) {
  const url = new URL(urlStr)
  const options = {method: 'HEAD', host: url.host, port: 80, path: url.pathname}


  return new Promise((resolve) => {
    try {
      const req = http.request(options, function (r: IncomingMessage) {
        if (r.statusCode === 200) {
          resolve(true)
        } else {
          resolve(false)
        }
      });


      req.end();
    } catch (e) {
      console.error(e)
    }
  })

}

