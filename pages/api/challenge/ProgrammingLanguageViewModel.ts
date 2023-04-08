enum ProgrammingLanguageViewModel {
  JAVASCRIPT = "javascript",
  TYPESCRIPT = "typescript",
  OTHER = "other"
}

export function parseProgrammingLanguageViewModel(programmingLanguage: string) {
  if (programmingLanguage === ProgrammingLanguageViewModel.JAVASCRIPT) {
    return ProgrammingLanguageViewModel.JAVASCRIPT
  } else if (programmingLanguage === ProgrammingLanguageViewModel.TYPESCRIPT) {
    return ProgrammingLanguageViewModel.TYPESCRIPT
  } else {
    return ProgrammingLanguageViewModel.OTHER
  }
}

export default ProgrammingLanguageViewModel
