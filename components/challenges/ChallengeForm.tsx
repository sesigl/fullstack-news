import {useState} from "react";
import {trackEvent} from "../../libs/parser/infrastructure/splitbee/trackEvent";
import ChallengeViewModel from "../../libs/interfaces/viewModels/ChallengeViewModel";
import {Controller, useForm} from "react-hook-form";
import CodeEditor from "../editor/CodeEditor";
import ProgrammingLanguageViewModel, {
  parseProgrammingLanguageViewModel
} from "../../pages/api/challenge/ProgrammingLanguageViewModel";
import ChallengeFormInputField from "./ChallengeFormInputField";
import {CreateChallengeCommand} from "../../libs/interfaces/commands/CreateChallengeCommand";
import {UpdateChallengeCommand} from "../../libs/interfaces/commands/UpdateChallengeCommand";
import {toast} from "react-toastify";
import {useRouter} from "next/router";
import Select from "react-select";
import {ErrorMessage} from "@hookform/error-message";
import ArticleSelectionViewModel from "../../libs/interfaces/viewModels/ArticleSelectionViewModel";
import makeAnimated from "react-select/animated";
import RunCodeResult from "../../libs/parser/domain/challenge/RunCodeResult";
import EditorResults, {CodeExecutionResultStatus} from "../editor/EditorResults";
import UserViewModel from "../../libs/interfaces/viewModels/UserViewModel";

interface ChallengeFormData {
  name: string,
  description: string,
  goal: string,

  exampleSolutionCode: string,
  solutionTemplateCode: string,
  testCode: string,

  articleIds: string[]

  language: ProgrammingLanguageViewModel
}

enum FormState {
  IN_PROGRESS,
  RUNNING_TEST_TASK,
}

export default function ChallengeForm({
                                        user,
                                        challenge,
                                        jestTypings,
                                        articleSelectionViewModels
                                      }: { jestTypings?: string, user: UserViewModel, challenge?: ChallengeViewModel, articleSelectionViewModels: ArticleSelectionViewModel[] }) {

  const router = useRouter()

  const [codeExecutionResult, setCodeExecutionResult] = useState<RunCodeResult | string | undefined>(undefined)
  const [codeExecutionResultStatus, setCodeExecutionResultStatus] = useState<CodeExecutionResultStatus>("SUCCESS")

  const [formState, setFormState] = useState<FormState>(FormState.IN_PROGRESS)

  const onSubmit = async (data: ChallengeFormData) => {

    setFormState(FormState.RUNNING_TEST_TASK)

    const isSolutionAndTestSuccessful = await runTestAndExampleSolution();

    if (!isSolutionAndTestSuccessful) {
      toast(
          <>
            <p><b>Test execution failed</b></p>
            <p></p>
            <p>There are test failures or no tests were executed.</p>
          </>, {type: "error"})

      setFormState(FormState.IN_PROGRESS)

      return false
    }

    const generalData = {
      challengeName: data.name,
      description: data.description,
      "exampleSolution": getValues('exampleSolutionCode'),
      goal: data.goal,
      programmingLanguage: data.language,
      templateSolution: getValues('solutionTemplateCode'),
      "testCode": getValues('testCode'),
      articleIds: getValues('articleIds')
    }

    let dataToBeSend: Omit<CreateChallengeCommand | UpdateChallengeCommand, "auth0UserId">
    if (challenge) {
      dataToBeSend = {
        type: "update",
        id: challenge.id,
        ...generalData
      } as Omit<UpdateChallengeCommand, "auth0UserId">
    } else {
      dataToBeSend = {
        id: undefined,
        type: "create",
        ...generalData
      } as Omit<CreateChallengeCommand, "auth0UserId">
    }

    const result = await fetch("/api/challenge/addChallenge", {
      credentials: 'include',
      method: challenge ? 'PUT' : 'POST',
      body: JSON.stringify(dataToBeSend),
      headers: {
        'Content-Type': 'application/json'
      },
    })

    if (result.status === 201) {
      trackEvent("Challenge saved", {userId: user.id, name: data.name, type: dataToBeSend.type})
      .catch(console.error)

      setFormState(FormState.IN_PROGRESS)

      toast(<>
        <p><b>Challenge saved</b></p>
        <p></p>
        <p>You will receive a notification once the challenge is live.</p>
      </>, {type: "success"})

      router.push("/challenges")
    } else {
      const errorMessage = await result.text()
      toast(
          <>
            <p><b>Something went wrong</b></p>
            <p></p>
            <p>{errorMessage}</p>
          </>, {type: "error"})
    }

    setFormState(FormState.IN_PROGRESS)
  }

  const {register, handleSubmit, watch, control, getValues, setValue, formState: {errors}} = useForm<ChallengeFormData>({
    defaultValues: {
      name: challenge?.name,
      description: challenge?.description,
      goal: challenge?.goal,
      language: challenge ? parseProgrammingLanguageViewModel(challenge.language) : undefined,

      testCode: challenge?.testCode,
      exampleSolutionCode: challenge?.exampleSolution,
      solutionTemplateCode: challenge?.templateSolution,

      articleIds: challenge?.articleIds ?? (router.query.articleId ? [router.query.articleId as string] : []),
    }
  });

  const watchAll = watch()

  async function runTestAndExampleSolution() {
    try {
      const fetchResult = await fetch("/api/challenge/runCode", {
        method: "POST",
        body: JSON.stringify({
          testCode: getValues('testCode'),
          exampleSolutionCode: getValues('exampleSolutionCode'),
          language: getValues('language')
        }),
        headers: {
          'Content-Type': 'application/json'
        },
      })

      if (fetchResult.status === 200) {
        const json: RunCodeResult = await fetchResult.json()


        setCodeExecutionResult(json)
        let onlySuccessfulTests = json.numFailedTests === 0 && json.numPassedTests > 0;

        if (onlySuccessfulTests) {
          setCodeExecutionResultStatus(onlySuccessfulTests ? "SUCCESS" : "FAILURE")
        } else {
          return false
        }
      } else {
        let errorText = await fetchResult.text();
        setCodeExecutionResult(errorText)
        setCodeExecutionResultStatus("FAILURE")
        return false
      }

    } catch (e) {
      setCodeExecutionResult(`Something went wrong: ${e}`)
      setCodeExecutionResultStatus("FAILURE")
      return false
    }

    return true;
  }

  async function checkExampleAndTests() {
    await runTestAndExampleSolution();
  }

  const infoClassName = "text-grey-dark text-xs italic p-1 text-gray-500"
  const errorClassName = "text-red-500 text-xs italic p-1"

  const options= articleSelectionViewModels.map(articleSelection => ({
    value: articleSelection.id, label: articleSelection.title
  }))

  options.sort((a1, a2) => (a1.label > a2.label ? 1 : -1))

  const animatedComponents = makeAnimated();

  return (
      <div className="flex">
        {/* Content */}
        <div className="relative flex flex-col flex-wrap mt-6 w-full">
          <div
              className={`box-border flex flex-col justify-between flex-1 w-full md:px-0 w-full`}>
            <div>
              <form className="flex flex-col items-start" onSubmit={handleSubmit(onSubmit)}>

                <h3 className="pb-2.5 text-2xl font-medium text-gray-900  before:left-0 before:w-24">
                  General information
                </h3>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <ChallengeFormInputField<ChallengeFormData>
                      type="text"
                      label="Challenge Name"
                      name={"name"}
                      description="Pick a name that helps you and others to know what the challenge is about."
                      placeholder="e.g. Convert lower-case string to upper-case string"
                      register={register} errors={errors}/>
                </div>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <label
                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                      htmlFor="articleIds">
                    Articles
                  </label>

                  <Controller
                      control={control}
                      defaultValue={challenge?.articleIds ?? []}
                      name="articleIds"
                      render={({ field: { onChange, value}}) => (
                          <Select
                              value={options.filter(c => value.includes(c.value))}
                              onChange={val => onChange(val.map(c => c.value))}
                              options={options}
                              isMulti
                              components={animatedComponents}
                          />
                      )}
                  />


                  <p className={infoClassName}>Select your favorite 1 or more article that fit to the coding task. Below the selected articles, the coding task is shown.</p>
                  <ErrorMessage errors={errors} name="favoriteCategories"
                                render={({message}) => <p
                                    className={errorClassName}>{message}</p>}/>

                </div>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <ChallengeFormInputField<ChallengeFormData>
                      type="text"
                      label="Description"
                      name="description"
                      description="Describe the challenge in more detail, elaborating about use-cases and what could be benefits of solving the exercise."
                      placeholder="e.g. For formatting or other reasons, converting strings from lower-case to upper-case is a useful functionality"
                      register={register} errors={errors}/>
                </div>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <ChallengeFormInputField<ChallengeFormData>
                      type="textarea"
                      label="Goal"
                      name="goal"
                      description="Describe the concrete goal what is the expected outcome, which describes the expected code to write."
                      placeholder={`e.g. Create a function named "convertToUpperCase" that takes one string argument.

- throws exception if null of undefined
- converts all characters that have an upper-case version to its upper-case version
- does not do any conversion for other characters

The return value must be a string.`}
                      register={register} errors={errors}/>
                </div>

                <h3 className="pb-2.5 text-2xl font-medium text-gray-900  before:left-0 before:w-24">
                  Coding Task
                </h3>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <label
                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                      htmlFor="language">
                    Programming Language
                  </label>
                  <div className="w-full">
                    <select {...register("language")} className="block w-full bg-grey-lighter text-grey-darker border border-grey-lighter focus:outline-none focus:ring-2 focus:ring-red-100 focus:bg-white duration-300 ease-in-out rounded py-3 px-4 read-only:text-gray-500">
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <span
                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">
                    Code template
                  </span>

                  <div className="w-full border-2 border-gray-200 rounded-2xl p-3 h-96 flex">
                    <CodeEditor language={watchAll.language} code={ challenge?.templateSolution ??
`function solution(parameter) {
  // your code goes here
}`} onChange={(code) => setValue("solutionTemplateCode", code)} typing={jestTypings}/>
                  </div>
                </div>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <span
                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">
                    Tests for automatic verification
                  </span>
                  <div className="w-full border-2 border-gray-200 rounded-2xl p-3 h-96 flex">
                    <CodeEditor language={watchAll.language} code={ challenge?.testCode ??
                      `describe("Your coding task name", () => {
 
  it("your first test case", () => {
    expect(true).toBe(true);
  });
 
 });                     
`} onChange={(code) => setValue("testCode", code)} typing={jestTypings}/>
                  </div>
                </div>

                <div className="bg-white rounded flex flex-col my-2 w-full">
                  <span
                      className="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2">
                    Example Solution
                  </span>
                  <div className="flex flex-row absolute right-4 cursor-pointer" onClick={checkExampleAndTests}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="green" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                    Try
                  </div>

                  <div className="w-full border-2 border-gray-200 rounded-2xl p-3 h-96 flex">
                    <CodeEditor language={watchAll.language} code={ challenge?.exampleSolution ??
                      `
function solution(parameter) {
  // your code goes here
}
`} onChange={code => setValue("exampleSolutionCode", code)} typing={jestTypings}/>
                  </div>

                  <EditorResults codeExecutionResult={codeExecutionResult} codeExecutionResultStatus={codeExecutionResultStatus} />

                </div>

                <div className={"w-full flex items-center align-middle flex-col"}>

                  <button
                      type={"submit"}
                      className={"w-60 mt-2 text-white font-bold py-2 px-4 rounded bg-red-700 hover:bg-red-800"
                          + (formState === FormState.RUNNING_TEST_TASK ? "bg-blue-500" : "")
                  }>
                    {formState === FormState.IN_PROGRESS && <></>}
                    {formState === FormState.RUNNING_TEST_TASK && <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 inline-block text-white"
                           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Executing
                    </>
                    }
                    Run example solution and save
                  </button>
                </div>


              </form>
            </div>
          </div>
        </div>
      </div>
  )
}
