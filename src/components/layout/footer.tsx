import Link from 'next/link'
import { siteConfig } from '@/site.config'
import { BrandLogoMono } from './logo'

const footerLinks = {
  product: {
    title: 'プロダクト',
    links: [
      { name: 'コンポーネント', href: '/components' },
      { name: 'デザイントークン', href: '/design-tokens' },
      { name: 'パターン', href: '/patterns' },
    ],
  },
  resources: {
    title: 'リソース',
    links: [
      { name: 'Figma Kit', href: '/figma' },
      { name: '変更履歴', href: '/changelog' },
      { name: 'GitHub', href: 'https://github.com' },
    ],
  },
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-muted">
      <div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="group inline-flex">
              <BrandLogoMono size={27} />
            </Link>
            <p className="mt-4 text-sm text-text-muted max-w-xs mx-auto md:mx-0">
              デザインとコードをひとつに。
              <br />
              トークン駆動のUIコンポーネントライブラリ。
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="text-center md:text-left">
              <h3 className="font-semibold text-sm text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} {siteConfig.name} Design System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
