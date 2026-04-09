export interface RegistryFile {
  path: string
  content: string
  type: 'ui' | 'lib'
}

export interface RegistryItem {
  name: string
  dependencies: string[]
  registryDependencies: string[]
  reverseDependencies: string[]
  files: RegistryFile[]
  namespace: boolean
  description: string
  aliases?: string[]
}

export type Registry = Record<string, RegistryItem>
