# Project contract

## Target

- Framework: Astro with TypeScript strict mode.
- Output: static files only; no SSR adapter or database.
- Hosting: GitHub Pages through GitHub Actions.
- Source of truth: one JSON file per product/category.
- Mock role: visual/layout reference only.
- Commerce mode: display-only catalog with direct seller contact; no cart, checkout, payment, or account system.
- Display currency: USD only, shown with the `$` symbol.

The initial `mock/` snapshot is about 1.4 GB and is a Shopify demo for city-map artwork. It includes large volumes of duplicate image derivatives and Shopify runtime assets. Do not mistake that content for the wallet catalog.

## Required structure

```text
src/content/products/<product-slug>.json
src/content/categories/<category-slug>.json
public/images/products/<product-slug>/...
public/images/categories/<category-slug>/...
```

Keep global brand assets, page imagery, fonts, and icons in their corresponding folders under `public/`. Do not place catalog records in components.

Category membership is declared by `product.categorySlugs`. Category records hold metadata and presentation order, not duplicated product arrays.

Keep seller contact channels and global site data in one validated config such as `src/data/site.json`.

## Navigation and routes

The desktop and mobile navigation must use this order:

1. `HOME`
2. `COLLECTION`
3. `HOW IT'S MADE`
4. `ABOUT`
5. `HOW TO ORDER`
6. `CONTACT`

`COLLECTION` exposes exactly five items: `ALL PRODUCT`, `NORTH`, `EAST`, `SOUTH`, and `WEST`. Treat `ALL PRODUCT` as the aggregate collection route, not a duplicate category record. The other four items map to category JSON records.

Use the text wordmark `BOHUC` as the logo. Style it in HTML/CSS to fit the reference theme and keep it accessible as the home link. Do not show cart or user/login icons.

## Product invariants

Each product must provide:

- unique `slug`, equal to the JSON filename;
- `name`, `status`, summary/description, and category references;
- integer price in USD cents with `currency` fixed to the literal `USD`;
- at least one image for an active product;
- non-empty, contextual alt text;
- optional `styles` descriptive content that is rendered as static text, never a selectable variant control;
- SEO title and description, with intentional fallbacks allowed in the schema.

Validation must cover both schema shape and cross-file constraints. Fail the build with a message that identifies the record and field.

Format prices with `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`. Do not concatenate `$` manually. For example, stored amount `12900` renders as `$129.00`.

## URL and asset invariants

- Generate routes for active content with `getStaticPaths()` or the current Astro equivalent.
- Centralize URL construction and normalize leading/trailing slashes.
- Store public asset references as repository-relative paths without a leading slash, then prefix Astro's base URL through the centralized helper.
- Never hard-code `/static-wallet/` in page/component markup.
- Resolve GitHub Pages `site` and `base` from deploy configuration so local preview and a future custom domain remain viable.
- Avoid Shopify CDN URLs in production output.

## Presentation behavior

Keep all catalog content and contact links useful without JavaScript. Hydrate only navigation behavior that cannot reasonably be achieved with native HTML/CSS.

Collection pages render four product cards per row at the desktop breakpoint, then reduce columns responsively for smaller screens.

Product pages show only the product media/information and always-visible `Product Detail` and `Style` content. Do not use dropdowns, accordion toggles, option controls, add-to-cart buttons, or other affordances that imply selection or purchasing.

## Contact ordering

Contact is the only ordering handoff. Render accessible icons/links for the channels configured by the seller, such as:

- email using `mailto:`;
- Messenger using the seller's valid web/deep link;
- another explicitly configured messaging channel with an HTTPS fallback when needed.

Centralize these destinations, validate their schemes, open external web destinations safely, and provide visible/accessibility labels. Never invent seller handles. Do not build a cart, order form backend, checkout, payment flow, login, or fake success state.

## Asset policy

Select only assets actually used by the finished pages. Prefer stable descriptive filenames and modern web formats. Keep an original only when it has a documented production purpose. Generate responsive derivatives deliberately rather than retaining Shopify's many query/download variants.

Check font and image usage rights before publishing mock-derived files.
