import ProgrammingLanguage from "./ProgrammingLanugage";
import RunCodeResult from "./RunCodeResult";

export default interface CodeExecutor {
  run(code: string, programmingLanguage: ProgrammingLanguage): Promise<RunCodeResult>;
}
