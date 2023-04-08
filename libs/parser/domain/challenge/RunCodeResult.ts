import {Status} from "@jest/test-result";

export default interface RunCodeResult {
  numFailedTests: number,
  numPassedTests: number,
  globalFailureMessages: string[],
  testResults: {
    status: Status,
    name: string,
    failureMessage: string[]
  }[],
}
