import {NextApiRequest, NextApiResponse} from "next";

export default class RequestResponseFakeFactory {

  get(): { request: NextApiRequest, response: NextApiResponse } {
    const request = {
      query: {},
      body: {}
    } as NextApiRequest;

    const response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn().mockImplementation(() => response),
      send: jest.fn().mockImplementation(() => response),
    } as unknown as NextApiResponse;

    return {request, response}
  }

  getWithBody(body: Record<string, any>): { request: NextApiRequest, response: NextApiResponse } {
    const {request, response} = this.get()

    request.body = body

    return {request, response}
  }

}
