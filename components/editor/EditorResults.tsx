import RunCodeResult from "../../libs/parser/domain/challenge/RunCodeResult";

var Convert = require('ansi-to-html');
var convert = new Convert();

export type CodeExecutionResultStatus = "SUCCESS" | "FAILURE" | "UNKNOWN";

export default function EditorResults({codeExecutionResult, codeExecutionResultStatus}: { codeExecutionResultStatus:  CodeExecutionResultStatus, codeExecutionResult: RunCodeResult | string | undefined }) {

  return <>
    {
        codeExecutionResult && codeExecutionResult !== "" && (
            <div className={"bg-black p-4 text-amber-50 mt-2 flex flex-row"}>
              <div className="w-2">
                {
                  codeExecutionResultStatus === "SUCCESS" ?
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                           strokeWidth={1.5} stroke="green" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                      </svg>
                      :
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                           strokeWidth={1.5} stroke="red" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                      </svg>

                }
              </div>

              <div className="ml-6">
                {codeExecutionResult && typeof codeExecutionResult === "string" && (
                    codeExecutionResult
                )}

                {codeExecutionResult && typeof codeExecutionResult !== "string" && (
                    <>
                      <div>
                        {codeExecutionResult.numPassedTests} / {codeExecutionResult.numPassedTests + codeExecutionResult.numFailedTests} tests
                        succeeded
                      </div>

                      <div>

                        {(!codeExecutionResult.testResults || codeExecutionResult.testResults.length === 0) && codeExecutionResult.globalFailureMessages && Array.isArray(codeExecutionResult.globalFailureMessages) && codeExecutionResult.globalFailureMessages.map((failureMessage, index) => {
                              return (
                                  <div key={failureMessage + index} className="pt-2">

                                    <div dangerouslySetInnerHTML={{
                                      __html:
                                          convert.toHtml(failureMessage).split(" at ")[0]
                                          .replaceAll("#A00", "#EF4444")
                                          .replaceAll("#555", "#bbbbbb")
                                    }}>
                                    </div>


                                  </div>

                              )
                            }
                        )}

                        {codeExecutionResult.testResults.map((testResult, index: number) => (
                            <div key={testResult.name + index} className="pt-2">
                              <div>
                                ● {testResult.name} ... <span
                                  className={`font-bold ${testResult.status === "passed" ? "text-green-500" : "text-red-500"}`}>{testResult.status}</span>
                              </div>
                              {testResult.failureMessage &&


                                  <div dangerouslySetInnerHTML={{
                                    __html:
                                        convert.toHtml(
                                            testResult.failureMessage.join("<br>").split(" at ")[0]).replaceAll("#A00", "#EF4444")
                                  }}>

                                  </div>
                              }

                            </div>

                        ))}
                      </div>
                    </>

                )}
              </div>
            </div>
        )
    }
  </>
}
