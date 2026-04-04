import { siteConfig } from '@/site.config'

type BreadcrumbItem = { name: string; href: string }

// Build locale-aware full URL
function localeUrl(path: string, locale?: string): string {
  const base = siteConfig.siteUrl
  if (!locale || locale === 'en') return `${base}${path}`
  return `${base}/${locale}${path}`
}

// Generate BreadcrumbList JSON-LD script tag
export function BreadcrumbJsonLd({ items, locale }: { items: BreadcrumbItem[]; locale?: string }) {
  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: localeUrl('', locale) },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: localeUrl(item.href, locale),
      })),
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
    />
  )
}
