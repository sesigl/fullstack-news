// @ts-nocheck
import {NextApiRequest, NextApiResponse} from "next";
import {runCLI} from "@jest/core"
import * as runtime from "jest-environment-node"
import * as testSequencer from "@jest/test-sequencer"
import * as jestRunner from "jest-runner"
import * as babelPresetCurrentNodeSyntax from "babel-preset-current-node-syntax"
import * as babelPluginObjectSpread from "@babel/plugin-syntax-object-rest-spread"
import * as babelPluginAsyncGenerators from "@babel/plugin-syntax-async-generators"
import * as babelPluginCatchBinding from "@babel/plugin-syntax-optional-catch-binding"
import * as babelPluginJsonStrings from "@babel/plugin-syntax-json-strings"
import * as babelPluginBigInt from "@babel/plugin-syntax-bigint"
import * as babelPluginOptionalChaining from "@babel/plugin-syntax-optional-chaining"
import * as babelPluginNullishCoalescingOperator
  from "@babel/plugin-syntax-nullish-coalescing-operator"
import * as babelPluginNumericSeparator from "@babel/plugin-syntax-numeric-separator"
import * as babelPluginClassProperties from "@babel/plugin-syntax-class-properties"
import * as babelPluginLogicalAssignmentOperators
  from "@babel/plugin-syntax-logical-assignment-operators"
import fs from "fs";
import * as ts from "typescript";
import ProgrammingLanguageViewModel, {
  parseProgrammingLanguageViewModel
} from "./ProgrammingLanguageViewModel";


function translateToJavaScript(testCode: string, programmingLanguage: ProgrammingLanguageViewModel) {

  let jsCode = testCode;

  if (programmingLanguage === ProgrammingLanguageViewModel.TYPESCRIPT) {
    let result = ts.transpileModule(testCode, {compilerOptions: {module: ts.ModuleKind.CommonJS}});
    jsCode = result.outputText
  }

  return jsCode
}

async function runTests(jsCode: string, testDir: string) {

  await fs.promises.writeFile(testDir + "./tmpFile.spec.js", jsCode)

  const results = await runCLI(
      {$0: "", _: [], json: false, testPathPattern: ['tmpFile.spec.js']},
      [testDir]
  )

  const reply: RunCodeReply = {
    numFailedTests: results.results.numFailedTests,
    numPassedTests: results.results.numPassedTests,
    testResults: results.results.testResults
    .flatMap(testResult => (testResult.testResults))
    .map(testResult => ({
      status: testResult.status,
      name: testResult.fullName,
      failureMessage: testResult.failureMessages
    })),
    globalFailureMessages: []
  }

  reply.globalFailureMessages = results.results.testResults.map(testResult => (testResult.failureMessage))
  .filter(msg => !!msg)

  return reply;
}

async function ensureTestDirectoryExists() {
  const jestConfigFile = `
   const config = {
      verbose: true,
    };
    
    module.exports = config;
  `

  const testDir = `/tmp/${new Date().getTime()}/`

  await fs.promises.mkdir(testDir, {recursive: true})

  await fs.promises.writeFile(`${testDir}/jest.config.js`, jestConfigFile)
  return testDir;
}

export default async function handler(request: NextApiRequest,
                                      response: NextApiResponse) {

  console.log('runtime', runtime.default.name)
  console.log('testSequencer', testSequencer.default.name)
  console.log('jestRunner', jestRunner.default.name)
  console.log('babelPresetCurrentNodeSyntax', babelPresetCurrentNodeSyntax.default.name)
  console.log('babelPluginObjectSpread', babelPluginObjectSpread.default.name)
  console.log('babelPluginCatchBinding', babelPluginCatchBinding.default.name)
  console.log('babelPluginJsonStrings', babelPluginJsonStrings.default.name)
  console.log('babelPluginBigInt', babelPluginBigInt.default.name)
  console.log('babelPluginOptionalChaining', babelPluginOptionalChaining.default.name)
  console.log('babelPluginNullishCoalescingOperator', babelPluginNullishCoalescingOperator.default.name)
  console.log('babelPluginNumericSeparator', babelPluginNumericSeparator.default.name)
  console.log('babelPluginClassProperties', babelPluginClassProperties.default.name)
  console.log('babelPluginLogicalAssignmentOperators', babelPluginLogicalAssignmentOperators.default.name)
  console.log('babelPluginAsyncGenerators', babelPluginAsyncGenerators.default.name)
  const testCode = request.body.testCode
  const exampleSolutionCode = request.body.exampleSolutionCode
  const language = parseProgrammingLanguageViewModel(request.body.language)

  if (!testCode) {
    response.status(400).send("No test code given")
    return
  }

  if (!exampleSolutionCode) {
    response.status(400).send("No example code given")
    return
  }

  if (!language) {
    response.status(400).send("Not supported programming language")
    return
  }

  const testDir = await ensureTestDirectoryExists();

  let jsCode = translateToJavaScript(`
    ${exampleSolutionCode}
    ${testCode}
  `, language);

  const reply = await runTests(jsCode, testDir);

  response.status(200).json(reply)

}
