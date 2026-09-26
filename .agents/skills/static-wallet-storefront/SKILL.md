---
name: static-wallet-storefront
description: Build, review, or maintain this repository's display-only wallet catalog as an Astro static site deployed to GitHub Pages, including production UI components, JSON product/category data, BOHUC branding, direct-contact ordering, validation, SEO, and deployment. Use for implementation work in this repository; do not add Shopify runtime, accounts, cart, checkout, or payment behavior.
---

# Static Wallet Storefront

Maintain the repository as a fully static wallet storefront. The legacy `mock/` snapshot has been removed; use the production components, styles, JSON content, public assets, and current user-provided references as the source of truth.

Before implementation or architecture changes, read:

- [Project contract](references/project-contract.md) for fixed architectural and data decisions.
- [Delivery checklist](references/delivery-checklist.md) for the relevant phase and required verification.
- [`docs/IMPLEMENTATION_PLAN.md`](../../../docs/IMPLEMENTATION_PLAN.md) when estimating scope, sequencing work, or reviewing completion.

## Working rules

1. Inspect the current worktree and preserve user changes. The repository may evolve beyond the initial empty scaffold.
2. Preserve and refine the established reusable components. Do not reintroduce Shopify scripts, checkout/account logic, tracking code, CDN query URLs, or archived demo assets.
3. Keep product and category content in individual JSON files validated at build time. Adding an ordinary product must not require editing a central registry or application code.
4. Keep product images in the matching slug folder. Verify every referenced file exists and every meaningful image has non-empty alt text.
5. Generate all active product/category routes at build time. Retain useful server-rendered HTML; use client JavaScript only where interaction requires it.
6. Make links and assets base-path safe. Use Astro URL/config helpers instead of hard-coding the repository path or deployment domain in components.
7. Keep the site display-only. Do not implement cart, add-to-cart, checkout, payment, login/account, user icon, or interactive product variants.
8. Prefer TypeScript strict mode, small framework-native components, CSS custom properties, and minimal dependencies. Add a dependency only when it removes meaningful project complexity.
9. Preserve the established BOHUC design tokens and responsive behavior. When the user supplies a screenshot or recording, treat it as a scoped visual reference without assuming an archived source page exists locally.
10. Use the text wordmark `BOHUC` as the site logo and preserve the required navigation/collection structure from the project contract.
11. Store prices as integer USD cents, require the `USD` currency code, and format every displayed price as `$` currency through `Intl.NumberFormat`.
12. Run checks proportional to the change. Never report completion while relevant build, schema, route, asset, accessibility, contact-link, currency, or deployment checks are failing.

## Implementation order

Work in vertical slices:

1. Establish config, base-path handling, design tokens, and the shared page shell.
2. Establish schemas, fixtures, catalog loaders, and cross-reference/asset validation.
3. Deliver listing and detail routes using real catalog data.
4. Deliver static Product Detail/Style sections and direct seller-contact links.
5. Add metadata/structured data, tests, and the Pages workflow.

For each slice, make the smallest coherent change, verify it, and update project documentation when the contributor workflow changes.

## Decision gates

Stop and ask for user direction only when a missing choice materially changes implementation, especially:

- the actual email, Messenger, or other seller contact destinations;
- real product data or permission to use placeholders;
- the right to publish user-provided or legacy-derived assets;
- custom-domain requirements that change `site`/`base` behavior.

Continue with reversible, clearly labeled fixtures when a detail does not affect architecture.
