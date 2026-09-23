# BOHUC static catalog

A display-only Astro catalog for BOHUC. The site is generated as static HTML and deploys to GitHub Pages. It intentionally has no account, cart, checkout, or payment flow.

## Local development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run validate:catalog
npm run check
npm test
npm run build
```

Test the GitHub Pages subpath locally with:

```bash
BASE_PATH=/static-wallet SITE_URL=https://bohucleather-max.github.io npm run build
npm run preview
```

## Add a product

1. Create `public/images/products/<slug>/` and add descriptively named images.
2. Copy an existing record in `src/content/products/` to `<slug>.json`.
3. Make its `slug` equal the filename, use integer USD cents, set `currency` to `USD`, and reference one or more existing image paths without a leading slash.
4. Add one or more of `north`, `east`, `south`, or `west` to `categorySlugs`.
5. Configure `styles`: use `["*"]` to show every registered leather, or list selected leather slugs from `src/data/leathers.json`.
6. Run `npm run validate:catalog && npm run build`.

No central product registry needs to be edited.

When a product contains more than one entry in `images`, its detail page automatically renders previous/next controls and a thumbnail strip. The first image remains the cover used by listing cards and social metadata.

## Configure leather styles

Leather metadata lives in `src/data/leathers.json`; texture images live in `public/images/leather/`. Each entry has a stable slug, display name, group, image path, alt text, and dimensions.

Every initial product uses:

```json
"styles": ["*"]
```

This renders all registered leathers as a static horizontal material reference. To limit a product later, replace the wildcard with explicit slugs, for example:

```json
"styles": ["outer-black-alligator", "lining-red-goat"]
```

Style samples are deliberately non-selectable and do not change price, product imagery, inventory, or ordering behavior.

## Add or edit a collection

The navigation contract contains exactly four named collections: North, East, South, and West. Edit their metadata in `src/content/categories/`. `ALL PRODUCT` is generated automatically and is not a category JSON file.

## Configure contact ordering

Edit `src/data/site.json` and add seller-provided destinations to `contacts`:

```json
{
  "type": "email",
  "label": "Email BOHUC",
  "href": "mailto:real-address@example.com"
}
```

HTTPS messaging links such as a seller-provided Messenger URL are also supported. Do not publish placeholder handles. Until real destinations are supplied, the contact pages show a clearly marked configuration notice instead of fake links.

The GitHub Pages workflow sets `REQUIRE_CONTACTS=true`, so production deployment intentionally fails until at least one real seller contact is configured. Local fixture builds remain available without it.

## Fixture content

The initial product names, copy, and selected images are fixtures derived from the supplied Shopify visual mock. Replace them with approved BOHUC catalog data and licensed assets before public launch. The `mock/` directory is reference material and is not bundled into the site.
