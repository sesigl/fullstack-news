import * as ts from "typescript";
import {injectable} from "tsyringe";

@injectable()
export default class TypeScriptToJavaScriptCodeConverter {

  convertTypeScriptToJavaScript(tsCode: string) {
    let result = ts.transpileModule(tsCode, {compilerOptions: {module: ts.ModuleKind.CommonJS}});
    const jsCode = result.outputText
    return jsCode
  }

}
