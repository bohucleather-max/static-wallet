# Delivery checklist

Use the sections relevant to the current change. Run broader checks before declaring the implementation or deployment complete.

## Scaffold and shared UI

- Astro static output and strict TypeScript are configured.
- Development, check, test, build, and preview scripts are documented.
- `site` and `base` work for local root and GitHub Pages project path.
- Layout, navigation, footer, typography, colors, spacing, focus styles, and reduced-motion behavior are reusable.
- The logo is the accessible text wordmark `BOHUC`.
- Navigation has the required six top-level items, including `WORKS`, and exactly five collection entries in the specified order.
- No cart or user/login icon is present.
- No Shopify runtime or archived demo dependency enters the application bundle.

## Catalog

- Product/category collections have build-time schemas.
- Duplicate slugs, missing categories, invalid prices/styles, and missing assets fail clearly.
- Active records generate deterministic routes; inactive/draft records do not leak.
- Adding a product requires only its JSON and image folder unless it introduces a new category.
- Product prices use integer cents and the schema rejects any currency other than `USD`.
- Currency formatting uses `Intl.NumberFormat` and renders the `$` symbol, never manual string concatenation.

## Pages and presentation

- Home, All Product, four collection, product, Works, About, How To Order, Contact, and 404 routes cover the agreed scope.
- Collection pages show four product cards per row on desktop and reduce columns responsively.
- Product pages expose only product information/media plus always-visible Product Detail and Style content.
- No add-to-cart, checkout, login, variant selector, fake clickable option, or collapsible detail/style control is rendered.
- Navigation and contact links are keyboard operable.
- Contact icons have accessible labels and open the configured seller channel directly.
- Empty, no-results, unavailable, and missing-content states are intentional.
- Essential catalog content remains readable without client JavaScript.

## SEO and quality

- Titles, descriptions, canonical URLs, Open Graph data, sitemap, and robots behavior are correct for the deployment URL.
- Product and breadcrumb JSON-LD reflect visible/current data.
- Images have dimensions where practical to avoid layout shift and meaningful alt text.
- Pages have one logical H1, semantic landmarks, visible focus, acceptable contrast, and touch targets.
- Test representative widths at 360, 768, 1280, and 1440 px.

## Deployment

- Type/schema checks, tests, and production build pass from a clean install.
- Production preview is checked under the configured base path.
- Internal links and asset references are checked for 404s.
- The Pages workflow uses official maintained actions and deploys `dist/`.
- No secrets, localhost URLs, Shopify demo links, cart/account code, source maps with sensitive content, or unused large mock assets ship.
- Direct navigation/refresh works for generated routes on GitHub Pages.
- The maintainer documentation includes exact add-product/add-category steps.

## Completion report

Report:

- what was implemented and what remains intentionally out of scope;
- configured contact channels and any destinations still using placeholders;
- commands run and results;
- deployed URL if deployment was requested and actually completed;
- known fixture content, licensing questions, or follow-up decisions.
