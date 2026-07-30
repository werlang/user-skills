---
name: seo-optimizer
description: |
  Diagnose, audit, implement, and verify search engine optimization (SEO) work in a project. Use for vague SEO help, SEO audits, technical SEO, indexing or crawl errors, ranking or traffic drops, migrations, on-page SEO, international SEO, Core Web Vitals, metadata, canonical URLs, robots.txt, sitemaps, structured data, social previews, semantic HTML, and explicit requests to fix or optimize SEO in code.
---

# SEO Optimizer

Unify diagnosis and implementation without turning every implementation request into a full audit. Route by user intent, gather evidence before making findings, and load only the audit checks and primary guidance relevant to the selected route.

## Route by Intent

Choose one route before inspecting the project:

1. **Audit-only**: For "audit", "review", "diagnose", "why am I not ranking?", traffic drops, or vague "help with SEO" requests, inspect and report. Do not modify files unless the user also asks for changes.
2. **Implementation-only**: For an explicit bounded change such as "add canonicals", "fix the sitemap", or "implement metadata", inspect the affected contract and likely blockers, then implement and verify. Do not force a full-site audit.
3. **Audit and implementation**: When the user asks for both, audit first, prioritize findings, implement the authorized scope, and re-check the changed behavior.
4. **Urgent diagnostic**: For migrations, sudden traffic loss, widespread deindexing, or production regressions, check crawlability, indexation, redirects, canonicals, robots directives, sitemap changes, and Search Console evidence before lower-priority on-page work.

Before asking questions, read `.agents/product-marketing.md`, `.claude/product-marketing.md`, or legacy `product-marketing-context.md` when present. Ask only for missing context that affects scope: important pages or queries, site type and business goal, recent changes or migrations, Search Console or analytics access, current traffic baseline, and relevant competitors.

## Evidence Rules

- State each finding as **verified**, **inferred**, or **not yet verified**.
- For every reported issue, include the evidence, likely impact, specific fix, priority, and how to verify the fix.
- Prefer repository and runtime evidence: route and template code, generated HTML, rendered DOM, HTTP status and headers, redirects, robots directives, sitemaps, Search Console, analytics, and field performance data.
- A static fetch or `curl` response cannot reliably disprove JavaScript-injected JSON-LD. Inspect the rendered DOM or use Google's Rich Results Test before reporting structured data as missing.
- Treat `site:` queries as coarse discovery checks, not authoritative index counts. Prefer Search Console for indexing and query evidence when access exists.
- Distinguish correlation from causation for ranking and traffic changes. Never guarantee rankings or claim that a change will produce a specific position.
- Use current primary-source guidance for rules that may change. Do not promote folklore, fixed character counts, heading counts, or unsupported ranking-factor claims to requirements.

## Current SEO Rules

1. **Titles**: Make title elements unique, descriptive, accurate, and concise. Google has no fixed title character limit and may generate title links from several page signals.
2. **Meta descriptions**: Write unique, relevant summaries for important pages. Google has no fixed meta-description character limit; snippets vary by query and device and may come from page content.
3. **Headings**: Use descriptive headings in a logical order for accessibility and clarity. Prefer one clear main visual or page title, but do not invent an SEO violation from multiple `<h1>` elements or a skipped level.
4. **Semantic markup**: Use semantic elements where they improve document structure and accessibility. Do not present replacing every `<div>` as a direct ranking requirement.
5. **Social metadata**: Open Graph and social-card metadata improve sharing previews. Do not describe them as direct Google ranking factors.
6. **Structured data**: Markup must match visible page content and a supported Google search feature. Validate the rendered output with Rich Results Test and inspect the rendered DOM. Valid markup creates eligibility; it does not guarantee rich results.
7. **Robots and index control**: `robots.txt` controls crawling; it is not a reliable deindexing mechanism. Use `noindex` on crawlable pages or access control when content must stay out of search, as appropriate.
8. **Sitemaps and canonicals**: Sitemaps should contain absolute, canonical, indexable URLs. Google ignores `<priority>` and `<changefreq>` and uses `<lastmod>` only when it is accurate. Canonical signals must be consistent across redirects, tags, internal links, and sitemaps.
9. **Core Web Vitals**: Good thresholds are LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Prefer field data for user impact and lab data for diagnosis.
10. **International SEO**: Hreflang sets need self-references and reciprocal links. `x-default` is a fallback. HTML, HTTP headers, and XML sitemaps are supported; one consistent method is usually easier to maintain.
11. **Content quality**: Favor helpful, reliable, people-first content. E-E-A-T is a quality self-assessment concept, not one ranking factor. Scaled low-value content, including low-value transformed or translated pages, can violate spam policies.

## Workflow

### Step 1: Reconnaissance

Locate public routes, layouts, metadata builders, render middleware, templates, CMS integrations, redirects, sitemaps, robots files, structured-data builders, and deployment configuration. Prefer targeted searches such as:

```bash
rg -n "<title|meta name=[\"']description|rel=[\"']canonical|application/ld\\+json" .
rg -n "metadata|generateMetadata|robots|sitemap|hreflang|redirect" .
rg --files | rg "(sitemap|robots|manifest|layout|head|template|route)"
```

Confirm the actual framework and rendering path before applying an example. Inspect shared metadata helpers before editing page-by-page declarations.

### Step 2: Audit by Progressive Disclosure

For audit-only, combined, or urgent routes, check the five layers in order. Stop expanding a layer when the available evidence is sufficient for the requested scope.

#### 1. Crawlability and indexation

- Status codes, redirect chains or loops, soft 404s, accidental authentication, crawl blocks, robots meta or `X-Robots-Tag`, and canonical conflicts.
- Sitemap accessibility, submission evidence, canonical/indexable/absolute URL membership, and accurate `lastmod`.
- Internal discoverability, orphan pages, pagination, parameters, faceted navigation, session IDs, and crawl-budget concerns for genuinely large or fast-changing sites.
- Search Console Page Indexing and URL Inspection evidence when available.

#### 2. Technical foundations

- HTTPS, mixed content, mobile rendering, responsive behavior, critical resource access, JavaScript rendering, and parity between initial HTML and rendered DOM.
- Core Web Vitals using field data where available; use PageSpeed Insights or Search Console for impact and DevTools, Lighthouse, or WebPageTest to diagnose causes.
- Architecture, descriptive URLs, duplicate URL variants, internal links, and consistent canonical signals.
- Structured data detection and validation using rendered output, not static-fetch absence.

#### 3. On-page search appearance and semantics

- Unique, accurate title elements and relevant meta descriptions without fixed character-count violations.
- Canonicals, index directives, language declarations, and social preview metadata.
- A clear page topic, descriptive headings, accessible semantics, image alt text where the image conveys meaning, explicit dimensions where useful for layout stability, responsive images, and sensible loading behavior.
- Search-intent alignment, natural terminology, internal anchor text, and cannibalization across pages.

#### 4. Content quality

- Whether content is original, current, useful, reliable, and created primarily for people.
- First-hand experience, expertise, sourcing, authorship, business transparency, and trust signals as self-assessment evidence, not a single ranking score.
- Thin, duplicate, doorway, mass-produced, or scaled low-value pages; content gaps; stale libraries; topical coverage; and whether pages satisfy the query better than alternatives.
- Do not label punctuation or generic prose patterns as proof of AI authorship or as an SEO violation. Evaluate the resulting usefulness and policy risk.

#### 5. Authority and links

- Important pages' internal prominence, broken links, relevant external citations, backlink losses or toxic-pattern concerns supported by available data, and realistic comparison with current competing results.
- Separate authority hypotheses from verified technical defects when backlink or competitor data is unavailable.

Load only the following specialized branch when it applies:

- **Migration or traffic drop**: old-to-new URL mapping, server-side permanent redirects, redirect chains, removed pages, canonical changes, robots changes, sitemap replacement, lost internal links, Search Console indexing, and analytics timing. Explain that recovery timing varies and may take weeks or longer.
- **International or multi-regional**: unique locale URLs, fully localized visible content and metadata, self and reciprocal hreflang, valid language-region codes, `x-default`, same-language canonicals, consistent protocol/host/path, and indexable 200 targets. Prefer one annotation method unless there is a tested reason to combine methods.
- **Large ecommerce or faceted navigation**: parameter controls, crawl traps, pagination fallback, category value, duplicate product descriptions, stock-state handling, canonical consistency, Product structured data, and sitemap segmentation.
- **Content or blog**: query mapping, cannibalization, stale posts, topical gaps, author and source transparency, internal linking, and consolidation or removal candidates.
- **Local business**: NAP consistency, individual location pages with unique content, Business Profile completeness, local citations, visible location details, and supported LocalBusiness structured data.
- **Performance**: LCP element and server path, image delivery, JavaScript work, CSS, fonts, caching, CDN behavior, INP interaction paths, and CLS sources. Keep field impact separate from lab diagnostics.

### Step 3: Report Findings

Use this structure for audit findings:

**Executive Summary**
- Scope and evidence available
- Top verified issues
- Important unknowns

**Findings**

For each finding:
- **Issue**
- **Status**: Verified, Inferred, or Not yet verified
- **Impact**: High, Medium, or Low
- **Evidence**
- **Fix**
- **Priority**
- **Verification**

Group findings under crawlability/indexation, technical foundations, on-page, content, and authority/links. End with a prioritized action plan: critical blockers, high-impact improvements, quick wins, then longer-term work.

### Step 4: Implement the Authorized Scope

Keep metadata and SEO behavior centralized in existing framework abstractions. Preserve route, component, model, helper, and rendering boundaries. Do not add a second metadata system when one already exists.

#### Standard HTML or server templates

Use route-specific values and absolute public URLs:

```html
<title>Accurate, concise page title | Site name</title>
<meta name="description" content="A unique summary that accurately describes this page.">
<link rel="canonical" href="https://example.com/current-page">

<meta property="og:title" content="Accurate page title">
<meta property="og:description" content="A useful sharing summary.">
<meta property="og:image" content="https://example.com/assets/og-image.jpg">
<meta property="og:url" content="https://example.com/current-page">
<meta property="og:type" content="website">
```

#### Next.js App Router

Use the project's existing metadata API and route data. Generate dynamic values when content or route parameters differ:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accurate page title | Site name",
  description: "A unique summary that accurately describes this page.",
  alternates: {
    canonical: "https://example.com/current-page",
  },
  openGraph: {
    title: "Accurate page title",
    description: "A useful sharing summary.",
    url: "https://example.com/current-page",
    images: [{
      url: "https://example.com/assets/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Description of the sharing image",
    }],
  },
};
```

#### Structured data

Choose a supported feature that matches visible content. Serialize trusted application data safely, inspect the rendered `<script type="application/ld+json">`, and validate the public page with Rich Results Test. Do not add types merely because Schema.org defines them.

#### Sitemap

Include only preferred public URLs:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
</urlset>
```

Omit `<lastmod>` unless the value reflects a meaningful page update. Do not emit `<priority>` or `<changefreq>` for Google.

#### robots.txt

Use crawl directives for crawler access and advertise the sitemap:

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

Do not use `robots.txt` as the only method to remove a URL from search results.

### Step 5: Verify

Run validation in proportion to the change:

1. Build, type-check, and run relevant tests.
2. Inspect generated initial HTML and the rendered DOM for titles, descriptions, canonicals, hreflang, robots directives, social metadata, and JSON-LD.
3. Follow representative public routes and verify status codes, redirects, canonical targets, and sitemap URLs against the deployed public origin.
4. Validate structured data with Rich Results Test or the relevant supported-feature test.
5. For Core Web Vitals, record field data separately from lab measurements and test representative mobile and desktop paths.
6. For indexation, migrations, or ranking diagnostics, use Search Console evidence when available and identify what remains unverified when it is not.
7. Re-audit the changed scope and report validation as passed, failed, blocked, or unrun.

## Primary Sources

Open only the sources relevant to the selected route:

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/crawling-indexing/robots/intro
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://developers.google.com/search/docs/monitor-debug/search-console-start
