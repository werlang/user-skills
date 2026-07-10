---
name: seo-optimizer
description: |
  Analyze, audit, and implement search engine optimization (SEO) best practices in a project. Use when the user requests to improve site indexing, fix Google Lighthouse SEO issues, add or modify meta tags, construct dynamic title and description templates, configure Open Graph (OG) or Twitter cards, implement JSON-LD structured data (schemas), fix heading hierarchy (h1-h6), ensure semantic HTML compliance, generate or configure sitemap.xml and robots.txt, or resolve layout shifts and asset optimization impacting Core Web Vitals.
---

# SEO Optimizer

A skill for auditing codebases, identifying SEO shortcomings, and implementing clean, high-performance SEO optimizations across various web frameworks.

## Principles of Modern SEO
1. **Dynamic, Unique Metadata**: Every route must have a unique title (50-60 characters) and a compelling meta description (150-160 characters).
2. **Single h1 Per Page**: Each page must have exactly one `<h1>` that represents the main topic of that page. Nest `<h2>`, `<h3>` etc. sequentially without skipping levels.
3. **Semantic Markup**: Leverage `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` rather than generic `<div>` wrappers.
4. **Rich Previews**: Provide robust Open Graph (og:title, og:description, og:image, og:url, og:type) and Twitter Card tags.
5. **Structured Data**: Include JSON-LD script blocks to help search engines understand the entity context (Organization, Website, Article, Product, LocalBusiness).
6. **Core Web Vitals**: Optimize images (`alt` attribute, specify `width`/`height` to avoid Cumulative Layout Shift, use `loading="lazy"` for below-the-fold content), and defer render-blocking JavaScript.

---

## Workflow

### Step 1: Codebase Reconnaissance & Search
Locate the application layout templates, routing structures, and pages. Run the following grep searches to find where SEO elements are currently configured:

```bash
# Locate meta viewport/title/description declarations
grep -rni "<meta" . --include="*.html" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"

# For Next.js projects, locate "metadata" configurations
grep -rni "metadata" . --include="layout.js" --include="layout.tsx" --include="page.js" --include="page.tsx"

# Locate existing sitemaps or robots.txt configurations
find . -name "sitemap*" -o -name "robots.txt"
```

---

### Step 2: SEO Audit Checklist
For every public page/route, verify:
* **Title Tag**: Is it present, between 50-60 chars, and descriptive?
* **Meta Description**: Is it present, between 150-160 chars, and contains relevant keywords?
* **Canonical URL**: Is `<link rel="canonical" href="..." />` present to prevent duplicate content issues?
* **Robots Meta Tag**: Is it configured correctly (e.g. `<meta name="robots" content="index, follow" />`)?
* **Open Graph (OG) & Twitter Cards**: Are basic social sharing tags populated?
* **Heading Hierarchy**: Is there exactly one `<h1>`? Are other headings (`<h2>`, `<h3>`) logically nested?
* **Images**: Do all `<img>` tags have descriptive `alt` text? Do they have explicit sizes?
* **JSON-LD Schema**: Does the homepage or content pages have structured JSON-LD data?
* **Robots.txt & Sitemap**: Are they present in the public root?

---

### Step 3: Implementation Guide by Framework

#### A. Standard HTML / Vanilla JS
Modify `index.html` or template views to include standard headers:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unique Page Title - Site Name</title>
  <meta name="description" content="A compelling, keyword-rich description of this page's content that matches what the user is looking for (keep under 160 characters).">
  <link rel="canonical" href="https://example.com/current-page" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Unique Page Title - Site Name" />
  <meta property="og:description" content="A compelling description for social platforms." />
  <meta property="og:image" content="https://example.com/assets/og-image.jpg" />
  <meta property="og:url" content="https://example.com/current-page" />
  <meta property="og:type" content="website" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Unique Page Title - Site Name" />
  <meta name="twitter:description" content="A compelling description for Twitter." />
  <meta name="twitter:image" content="https://example.com/assets/og-image.jpg" />
  
  <!-- Structured Data (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Site Name",
    "url": "https://example.com"
  }
  </script>
</head>
<body>
  <!-- Semantic page layout -->
  <header>
    <nav>...</nav>
  </header>
  <main>
    <h1>The Main Topic of this Page</h1>
    <section>
      <h2>Subtopic Section</h2>
      <p>...</p>
    </section>
  </main>
  <footer>...</footer>
</body>
</html>
```

#### B. Next.js (App Router - metadata API)
In `layout.tsx` or `page.tsx`, export a `metadata` object or use the `generateMetadata` function for dynamic values:

```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unique Page Title | Site Name',
  description: 'Keyword-rich and engaging page description under 160 characters.',
  alternates: {
    canonical: 'https://example.com/dynamic-path',
  },
  openGraph: {
    title: 'Unique Page Title | Site Name',
    description: 'Social sharing description.',
    url: 'https://example.com/dynamic-path',
    siteName: 'Site Name',
    images: [
      {
        url: 'https://example.com/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Open Graph Image Description',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unique Page Title | Site Name',
    description: 'Twitter description.',
    images: ['https://example.com/assets/og-image.jpg'],
  },
};
```

To add JSON-LD in Next.js, insert a script block inside your page component:

```tsx
export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Company Name",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <h1>Page Title</h1>
        {/* ... */}
      </main>
    </>
  );
}
```

---

### Step 4: Auxiliary Configurations

#### sitemap.xml
A basic static sitemap in your public folder (or generated via a framework utility):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-06-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-06-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

#### robots.txt
Place this file in the public root folder (e.g. `public/robots.txt` or `static/robots.txt`):

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

---

### Step 5: SEO & Performance Audit Verification
Verify changes using:
1. **HTML Inspection**: Run the site dev server or build the application, then curl or inspect the generated DOM to verify that `<title>`, `<meta name="description">`, `<link rel="canonical">`, and the JSON-LD structure are correct in the initial HTML document (crucial for search engine crawlers that do not execute JS fully).
2. **Build Success**: Ensure your changes don't break page routing, server-side rendering (SSR), static site generation (SSG), or type-checking.
3. **Accessibility / Semantics Check**: Count the occurrences of `<h1>` to ensure it is exactly one, and verify all images have `alt` tags.
