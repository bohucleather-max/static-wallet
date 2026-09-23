---
name: static-wallet-storefront
description: Build, migrate, review, or maintain this repository's display-only wallet catalog as an Astro static site deployed to GitHub Pages, including mock-to-component reconstruction, JSON product/category data, BOHUC branding, direct-contact ordering, validation, SEO, and deployment. Use for implementation work in this repository; do not add Shopify runtime, accounts, cart, checkout, or payment behavior.
---

# Static Wallet Storefront

Implement the repository as a maintainable, fully static wallet storefront. Treat `mock/` as visual reference material, not application source.

Before implementation or architecture changes, read:

- [Project contract](references/project-contract.md) for fixed architectural and data decisions.
- [Delivery checklist](references/delivery-checklist.md) for the relevant phase and required verification.
- [`docs/IMPLEMENTATION_PLAN.md`](../../../docs/IMPLEMENTATION_PLAN.md) when estimating scope, sequencing work, or reviewing completion.

## Working rules

1. Inspect the current worktree and preserve user changes. The repository may evolve beyond the initial empty scaffold.
2. Reconstruct reusable components from the mock. Do not copy minified Shopify scripts, checkout/account logic, tracking code, CDN query URLs, or thousands of generated image derivatives.
3. Keep product and category content in individual JSON files validated at build time. Adding an ordinary product must not require editing a central registry or application code.
4. Keep product images in the matching slug folder. Verify every referenced file exists and every meaningful image has non-empty alt text.
5. Generate all active product/category routes at build time. Retain useful server-rendered HTML; use client JavaScript only where interaction requires it.
6. Make links and assets base-path safe. Use Astro URL/config helpers instead of hard-coding the repository path or deployment domain in components.
7. Keep the site display-only. Do not implement cart, add-to-cart, checkout, payment, login/account, user icon, or interactive product variants.
8. Prefer TypeScript strict mode, small framework-native components, CSS custom properties, and minimal dependencies. Add a dependency only when it removes meaningful project complexity.
9. Match the mock through observable tokens and responsive behavior, while replacing the map-art demo content with explicit wallet fixtures or real user-provided data.
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
- the right to publish mock-derived assets;
- custom-domain requirements that change `site`/`base` behavior.

Continue with reversible, clearly labeled fixtures when a detail does not affect architecture.
