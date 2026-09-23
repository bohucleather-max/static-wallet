import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(fileURLToPath(new URL("..", import.meta.url)));
const PRODUCT_DIR = join(ROOT, "src/content/products");
const CATEGORY_DIR = join(ROOT, "src/content/categories");
const PUBLIC_DIR = join(ROOT, "public");
const LEATHER_FILE = join(ROOT, "src/data/leathers.json");

function readJsonFiles(directory) {
  return readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({ file, data: JSON.parse(readFileSync(join(directory, file), "utf8")) }));
}

function validateImage(image, owner, errors) {
  if (!image || typeof image.src !== "string" || image.src.startsWith("/") || image.src.includes("://")) {
    errors.push(`${owner}: image src must be a repository-relative public path`);
    return;
  }
  if (!image.alt?.trim()) errors.push(`${owner}: image alt text is required`);
  if (!Number.isInteger(image.width) || image.width <= 0 || !Number.isInteger(image.height) || image.height <= 0) {
    errors.push(`${owner}: image width and height must be positive integers`);
  }
  if (!existsSync(join(PUBLIC_DIR, image.src))) errors.push(`${owner}: missing public/${image.src}`);
}

export function validateCatalog() {
  const errors = [];
  const categories = readJsonFiles(CATEGORY_DIR);
  const products = readJsonFiles(PRODUCT_DIR);
  const leathers = JSON.parse(readFileSync(LEATHER_FILE, "utf8"));
  const categorySlugs = new Set();
  const productSlugs = new Set();
  const leatherSlugs = new Set();

  if (!Array.isArray(leathers) || leathers.length === 0) errors.push("leathers.json: at least one leather is required");
  for (const [index, leather] of (leathers ?? []).entries()) {
    const owner = `leathers.json[${index}]`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(leather.slug ?? "")) errors.push(`${owner}: invalid slug`);
    if (leatherSlugs.has(leather.slug)) errors.push(`${owner}: duplicate leather slug ${leather.slug}`);
    leatherSlugs.add(leather.slug);
    if (!leather.name?.trim()) errors.push(`${owner}: name is required`);
    if (!['Outer Leather', 'Lining Leather'].includes(leather.group)) errors.push(`${owner}: invalid leather group`);
    validateImage(leather.image, owner, errors);
  }

  for (const { file, data } of categories) {
    const expected = basename(file, ".json");
    if (data.slug !== expected) errors.push(`${file}: slug must equal filename (${expected})`);
    if (categorySlugs.has(data.slug)) errors.push(`${file}: duplicate category slug ${data.slug}`);
    categorySlugs.add(data.slug);
    validateImage(data.image, file, errors);
  }

  const requiredCategories = ["north", "east", "south", "west"];
  if (requiredCategories.some((slug) => !categorySlugs.has(slug)) || categorySlugs.size !== 4) {
    errors.push("categories must contain exactly north, east, south, and west");
  }

  for (const { file, data } of products) {
    const expected = basename(file, ".json");
    if (data.slug !== expected) errors.push(`${file}: slug must equal filename (${expected})`);
    if (productSlugs.has(data.slug)) errors.push(`${file}: duplicate product slug ${data.slug}`);
    productSlugs.add(data.slug);
    if (data.price?.currency !== "USD") errors.push(`${file}: price.currency must be USD`);
    if (!Number.isInteger(data.price?.amount) || data.price.amount < 0) errors.push(`${file}: price.amount must be non-negative integer cents`);
    if (!Array.isArray(data.categorySlugs) || data.categorySlugs.length === 0) errors.push(`${file}: categorySlugs cannot be empty`);
    for (const slug of data.categorySlugs ?? []) {
      if (!categorySlugs.has(slug)) errors.push(`${file}: unknown category ${slug}`);
    }
    if (data.status === "active" && (!Array.isArray(data.images) || data.images.length === 0)) {
      errors.push(`${file}: active products need at least one image`);
    }
    for (const image of data.images ?? []) validateImage(image, file, errors);
    if (!Array.isArray(data.styles) || data.styles.length === 0) errors.push(`${file}: styles cannot be empty`);
    if (data.styles?.includes("*") && data.styles.length !== 1) errors.push(`${file}: wildcard style must be used alone`);
    for (const styleSlug of data.styles ?? []) {
      if (styleSlug !== "*" && !leatherSlugs.has(styleSlug)) errors.push(`${file}: unknown leather style ${styleSlug}`);
    }
  }

  const site = JSON.parse(readFileSync(join(ROOT, "src/data/site.json"), "utf8"));
  if (site.brand?.name !== "BOHUC") errors.push("site.json: brand.name must be BOHUC");
  if (site.pricing?.currency !== "USD") errors.push("site.json: pricing.currency must be USD");
  if (process.env.REQUIRE_CONTACTS === "true" && (site.contacts ?? []).length === 0) {
    errors.push("site.json: at least one real seller contact is required for production deployment");
  }
  for (const contact of site.contacts ?? []) {
    if (!contact.label?.trim()) errors.push("site.json: every contact needs a label");
    if (!/^(mailto:|https:\/\/)/.test(contact.href ?? "")) errors.push(`site.json: invalid contact URL for ${contact.type ?? "unknown"}`);
  }

  if (errors.length) throw new Error(`Catalog validation failed:\n- ${errors.join("\n- ")}`);
  return { products: products.length, categories: categories.length, leathers: leathers.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = validateCatalog();
    console.log(`Catalog valid: ${result.products} products, ${result.categories} categories, ${result.leathers} leathers.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
