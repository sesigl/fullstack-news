enum ProgrammingLanguage {
  JAVASCRIPT = "javascript",
  TYPESCRIPT = "typescript",
}

export function parseProgrammingLanguage(programmingLanguage: string): ProgrammingLanguage {
  if (programmingLanguage === ProgrammingLanguage.JAVASCRIPT) {
    return ProgrammingLanguage.JAVASCRIPT
  } else if (programmingLanguage === ProgrammingLanguage.TYPESCRIPT) {
    return ProgrammingLanguage.TYPESCRIPT
  } else {
    throw new Error(`Unknown programming language: ${programmingLanguage}`)
  }
}

export default ProgrammingLanguage
