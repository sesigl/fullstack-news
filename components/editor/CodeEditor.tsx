import React, {useEffect, useState} from "react";

import Editor from "@monaco-editor/react";
import ProgrammingLanguageViewModel from "../../pages/api/challenge/ProgrammingLanguageViewModel";

export default function CodeEditor({code, onChange, typing, language}: {language: ProgrammingLanguageViewModel, typing?: string, code: string, onChange?: (code: string) => void}) {
  const [value, setValue] = useState(code);
  const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguageViewModel>(ProgrammingLanguageViewModel.JAVASCRIPT);

  useEffect(() => {
    setProgrammingLanguage(language)
  }, [language])

  const handleEditorChange = (value: string | undefined) => {
    setValue(value ?? "");
    if (onChange) {
      onChange(value ?? "");
    }
  };

  return (
      <div className="overlay rounded-md overflow-hidden w-full shadow-4xl overflow-visible flex-1">
        <Editor
            height="100%"
            width={`100%`}
            language={programmingLanguage ?? "javascript"}
            value={value}
            defaultValue="// some comment"
            onChange={handleEditorChange}
            beforeMount={(monace) => {
              monace.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                onlyVisible: true,
                noSyntaxValidation: true,
                noSemanticValidation: true,
                noSuggestionDiagnostics: true})

              var libSource = typing ?? ""
              var libUri = 'ts:filename/facts.d.ts';

              monace.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri)
            }}
            options={{
              minimap: {
                enabled: false,
              },
              codeLens: false,
            }}
        />
      </div>
  );
};
