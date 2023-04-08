import React, {useState} from "react";
import CodeEditor from "../editor/CodeEditor";
import Tabs from "./Tabs";
import ChallengeViewModel from "../../libs/interfaces/viewModels/ChallengeViewModel";
import {RunChallengeRequestDto} from "../../pages/api/challenge/runChallenge";
import RunCodeResult from "../../libs/parser/domain/challenge/RunCodeResult";
import EditorResults, {CodeExecutionResultStatus} from "../editor/EditorResults";
import {toast} from "react-toastify";

export default function CodeSolutionEditor(props: {challenge: ChallengeViewModel, onClose: () => void}) {
  const [showModal, setShowModal] = React.useState(true);
  const [codeSolution, setCodeSolution] = React.useState(props.challenge.templateSolution);
  const [codeExecutionResult, setCodeExecutionResult] = useState<RunCodeResult | string | undefined>(undefined)
  const [codeExecutionResultStatus, setCodeExecutionResultStatus] = useState<CodeExecutionResultStatus>("UNKNOWN")

  function closeEditor() {
    setShowModal(false);
    props.onClose()
  }

  async function submitHandler() {
    let isResultOK = false

    const dataToBeSend: RunChallengeRequestDto = {
      challengeId: props.challenge.id,
      solutionCode: codeSolution
    }

    const result = await fetch("/api/challenge/runChallenge", {
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify(dataToBeSend),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (result.status === 200) {
      const runCodeResult: RunCodeResult = await result.json()
      setCodeExecutionResult(runCodeResult)
      if (runCodeResult.numFailedTests === 0 && runCodeResult.numPassedTests > 0) {
        isResultOK = true
      }
    }

    if (isResultOK) {
      setCodeExecutionResultStatus("SUCCESS")
      toast(<>
        <p><b>Coding task solved</b></p>
        <p></p>
        <p>Well done! All requirements were fulfilled. Keep it up!</p>
      </>, {type: "success"} )

      setTimeout(() => closeEditor(), 5000)
    } else {
      setCodeExecutionResultStatus("FAILURE")
      toast(<>
        <p><b>Coding task not solved</b></p>
        <p></p>
        <p>Revisit the description and do not hesitate to ask for help in our community.</p>
      </>, {type: "error"})
    }
  }

  return (
      <>
        <button
            className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            type="button"
            onClick={() => setShowModal(true)}
        >
          Open regular modal
        </button>
        {showModal ? (
            <>
              <div
                  className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              >
                <div className="relative w-full mx-10 my-3 mx-auto h-5/6">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-full overflow-scroll">
                    {/*header*/}
                    <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">
                        {props.challenge.name}
                      </h3>
                      <button
                          className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                          onClick={() => setShowModal(false)}
                      >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                      </button>
                    </div>
                    <Tabs tabContent={{
                      "Description": <div>{props.challenge.description}</div>,
                      "Goal": <div>{props.challenge.goal}</div>,
                      "Solution": <div className="h-full flex flex-col">
                        <CodeEditor language={props.challenge.language} code={props.challenge.templateSolution} onChange={(code) => setCodeSolution(code)} />
                        <EditorResults codeExecutionResult={codeExecutionResult} codeExecutionResultStatus={codeExecutionResultStatus} />
                      </div>
                    }}/>

                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                      <button
                          className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => {closeEditor()}}
                      >
                        Close
                      </button>
                      <button
                          className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={submitHandler}
                      >
                        Submit solution
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
        ) : null}
      </>
  );
}
