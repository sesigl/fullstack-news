import CodeExecutor from "../../domain/challenge/CodeExecutor";
import * as runtime from "jest-environment-node"
import * as testSequencer from "@jest/test-sequencer"
import * as jestRunner from "jest-runner"
// @ts-ignore
import * as babelPresetCurrentNodeSyntax from "babel-preset-current-node-syntax"
// @ts-ignore
import * as babelPluginObjectSpread from "@babel/plugin-syntax-object-rest-spread"
// @ts-ignore
// @ts-ignore
import * as babelPluginAsyncGenerators from "@babel/plugin-syntax-async-generators"
// @ts-ignore
import * as babelPluginCatchBinding from "@babel/plugin-syntax-optional-catch-binding"
// @ts-ignore
import * as babelPluginJsonStrings from "@babel/plugin-syntax-json-strings"
// @ts-ignore
import * as babelPluginBigInt from "@babel/plugin-syntax-bigint"
// @ts-ignore
import * as babelPluginOptionalChaining from "@babel/plugin-syntax-optional-chaining"
// @ts-ignore
import * as bpnullish from "@babel/plugin-syntax-nullish-coalescing-operator"
// @ts-ignore
import * as babelPluginNumericSeparator from "@babel/plugin-syntax-numeric-separator"
// @ts-ignore
import * as babelPluginClassProperties from "@babel/plugin-syntax-class-properties"
// @ts-ignore
import * as bpassignoperator from "@babel/plugin-syntax-logical-assignment-operators"
import fs from "fs";
import {runCLI} from "@jest/core";
import {inject, injectable} from "tsyringe";
import TypeScriptToJavaScriptCodeConverter from "./TypeScriptToJavaScriptCodeConverter";
import ProgrammingLanguage from "../../domain/challenge/ProgrammingLanugage";
import RunCodeResult from "../../domain/challenge/RunCodeResult";

function noOp(_noOpStrDependency: string, _ref: string) {
}

noOp('runtime', runtime.default.name)
noOp('testSequencer', testSequencer.default.name)
noOp('jestRunner', jestRunner.default.name)
noOp('babelPresetCurrentNodeSyntax', babelPresetCurrentNodeSyntax.default.name)
noOp('babelPluginObjectSpread', babelPluginObjectSpread.default.name)
noOp('babelPluginCatchBinding', babelPluginCatchBinding.default.name)
noOp('babelPluginJsonStrings', babelPluginJsonStrings.default.name)
noOp('babelPluginBigInt', babelPluginBigInt.default.name)
noOp('babelPluginOptionalChaining', babelPluginOptionalChaining.default.name)
noOp('babelPluginNullishCoalescingOperator', bpnullish.default.name)
noOp('babelPluginNumericSeparator', babelPluginNumericSeparator.default.name)
noOp('babelPluginClassProperties', babelPluginClassProperties.default.name)
noOp('babelPluginLogicalAssignmentOperators', bpassignoperator.default.name)
noOp('babelPluginAsyncGenerators', babelPluginAsyncGenerators.default.name)

@injectable()
export default class NodeJsCodeExecutor implements CodeExecutor {

  constructor(
      @inject(TypeScriptToJavaScriptCodeConverter) private readonly typeScriptToJavaScriptCodeConverter: TypeScriptToJavaScriptCodeConverter
  ) {
  }


  async run(code: string, programmingLanguage: ProgrammingLanguage): Promise<RunCodeResult> {

    if (programmingLanguage === ProgrammingLanguage.TYPESCRIPT) {
      code = this.typeScriptToJavaScriptCodeConverter.convertTypeScriptToJavaScript(code)
    }

    return await this.executeTests(code);
  }

  private async executeTests(code: string) {
    const testDir = await this.prepareTestInfrastructure(code);

    const results = await runCLI(
        {$0: "", _: [], json: false, testPathPattern: ['tmpFile.spec.js']},
        [testDir]
    )

    const reply: RunCodeResult = {
      numFailedTests: results.results.numFailedTests,
      numPassedTests: results.results.numPassedTests,
      globalFailureMessages: [],
      testResults: results.results.testResults
      .flatMap(testResult => (testResult.testResults))
      .map(testResult => ({
        status: testResult.status,
        name: testResult.fullName,
        failureMessage: testResult.failureMessages
      })),
    }

    const failureMessages =
        results.results.testResults.map(testResult => (testResult.failureMessage))
        .filter(msg => !!msg)


    reply.globalFailureMessages = failureMessages.filter(fm => !!fm) as string[]
    return reply;
  }

  private async prepareTestInfrastructure(code: string) {
    const testDir = await this.ensureTestDirectoryExists();

    await fs.promises.writeFile(testDir + "./tmpFile.spec.js", code)
    return testDir;
  }

  private async ensureTestDirectoryExists() {
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

}
