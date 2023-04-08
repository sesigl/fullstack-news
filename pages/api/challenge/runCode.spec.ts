import {beforeEach} from "@jest/globals";
import handler from "./runCode";
import RequestResponseFakeFactory from "../../../tests/libs/factory/RequestResponseFakeFactory";
import ProgrammingLanguageViewModel from "./ProgrammingLanguageViewModel";
import {mocked} from "jest-mock";
import {NextApiResponse} from "next";

jest.setTimeout(10000)

const successfulTest = `
          it("example test case", () => {
            const fnResult = fn(); 
            expect(fnResult).toBe(1)
          });
        `;

const failingTest = `
          it("example test case that should fail", () => {
            const fnResult = fn(); 
            expect(fnResult).toBe(2)
          });
        `;

function getRecordedResponse(response: NextApiResponse) {
  return mocked(response.json).mock.calls[0][0];
}

describe("runCode", () => {

  const requestResponseFakeFactory = new RequestResponseFakeFactory();

  let originalConsoleLog: { (message?: any, ...optionalParams: any[]): void; (...data: any[]): void };

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = jest.fn()
  })

  afterEach(() => {
    // @ts-ignore
    console.log = originalConsoleLog
  })

  it("returns 400 when requested programming language does not exist", async () => {
    const {request, response} = requestResponseFakeFactory.get()
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalledWith("No test code given")
  })

  it("returns 400 when no test code given", async () => {
    const {request, response} = requestResponseFakeFactory.get()
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.send).toHaveBeenCalledWith("No test code given")
  })

  it("executes test successfully", async () => {
    const {request, response} = requestResponseFakeFactory.getWithBody({
      exampleSolutionCode: `
        function fn() {
          return 1;
        }
      `,
      testCode: `
        describe("example test", () => {
          ${successfulTest}
        });
      `,
      language: ProgrammingLanguageViewModel.JAVASCRIPT
    })
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith({
      "globalFailureMessages": [],
      "numFailedTests": 0,
      "numPassedTests": 1,
      "testResults": [
        {
          "failureMessage": [],
          "name": "example test example test case",
          "status": "passed",
        }
      ],
    })
  })

  it("executes javascript test and returns test error", async () => {
    const {request, response} = requestResponseFakeFactory.getWithBody({
      exampleSolutionCode: `
        function fn() {
          return 1;
        }
      `,
      testCode: `
        describe("example test", () => {
          ${successfulTest}
          ${failingTest}
        });
      `,
      language: ProgrammingLanguageViewModel.JAVASCRIPT
    })
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(getRecordedResponse(response).numFailedTests).toBe(1)
    expect(getRecordedResponse(response).numPassedTests).toBe(1)
    expect(getRecordedResponse(response).testResults[0].failureMessage).toEqual([])
    expect(getRecordedResponse(response).globalFailureMessages[0]).toContain('expected')
    expect(getRecordedResponse(response).testResults[1].failureMessage[0]).toContain("expect")

  })

  it("executes typescript test and returns test error", async () => {
    const {request, response} = requestResponseFakeFactory.getWithBody({
      exampleSolutionCode: `
        function fn(): number {
          return 1;
        }
      `,
      testCode: `
        describe("example test", () => {
          ${successfulTest}
          ${failingTest}
        });
      `,
      language: ProgrammingLanguageViewModel.TYPESCRIPT
    })
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(getRecordedResponse(response).numFailedTests).toBe(1)
    expect(getRecordedResponse(response).numPassedTests).toBe(1)
    expect(getRecordedResponse(response).testResults[0].failureMessage).toEqual([])
    expect(getRecordedResponse(response).globalFailureMessages[0]).toContain('expected')
    expect(getRecordedResponse(response).testResults[1].failureMessage[0]).toContain("expect")

  })

  it("executes test and returns syntax errors", async () => {
    const {request, response} = requestResponseFakeFactory.getWithBody({
      exampleSolutionCode: `
        function fn(] {
          return 1;
        }
      `,
      testCode: `
        describe("example test", () => {
          ${successfulTest}
          ${failingTest}
        });
      `,
      language: ProgrammingLanguageViewModel.JAVASCRIPT
    })
    await handler(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(getRecordedResponse(response).numFailedTests).toBe(0)
    expect(getRecordedResponse(response).numPassedTests).toBe(0)
    expect(getRecordedResponse(response).testResults).toHaveLength(0)
    expect(getRecordedResponse(response).globalFailureMessages[0]).toContain('SyntaxError')

  })

})
