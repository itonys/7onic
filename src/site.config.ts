export type NavItem = {
  name: string
  mobileName: string
  href: string
  soon?: boolean
}

type BrandConfig = {
  brand: string
  name: string
  title: string
  subtitle: string
  description: string
  domain: string
  packageScope: string
  packageReact: string
  packageTokens: string
  storageKey: string
  navigation: NavItem[]
}

export const siteConfig: BrandConfig = {
  brand: '7onic',
  name: '7onic',
  title: '7onic',
  subtitle: 'DESIGN SYSTEM',
  description: 'A modern design system for web applications',
  domain: 'https://7onic-design.com',
  packageScope: '@7onic-ui',
  packageReact: '@7onic-ui/react',
  packageTokens: '@7onic-ui/tokens',
  storageKey: '7onic-theme',
  navigation: [
    { name: 'デザイントークン', mobileName: 'トークン', href: '/design-tokens' },
    { name: 'コンポーネント', mobileName: 'コンポーネント', href: '/components' },
    { name: 'パターン', mobileName: 'パターン', href: '/patterns', soon: true },
    { name: 'テンプレート', mobileName: 'テンプレート', href: '/templates', soon: true },
  ],
}
