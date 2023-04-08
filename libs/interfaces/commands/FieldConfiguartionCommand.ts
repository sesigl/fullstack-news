interface DynamicFieldConfigurationCommand {
  type: "DynamicFieldConfigurationCommand",
  objectPath: string,
  extractRegExp: string | null
}

// | "StaticFieldConfiguration" | "UseExistingCategoryImageFromField",
interface StaticFieldConfigurationCommand {
  type: "StaticFieldConfigurationCommand"
  value: string | null,
}

interface UseExistingCategoryImageFromFieldCommand {
  type: "UseExistingCategoryImageFromFieldCommand"
  objectPath: string,
}

export default interface FieldConfigurationCommand {
  configuration: DynamicFieldConfigurationCommand | StaticFieldConfigurationCommand | UseExistingCategoryImageFromFieldCommand
}
