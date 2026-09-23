import { getCollection, type CollectionEntry } from "astro:content";
import leatherData from "../data/leathers.json";

export type Product = CollectionEntry<"products">;
export type Category = CollectionEntry<"categories">;
export type Leather = (typeof leatherData)[number];

export const leathers: Leather[] = leatherData;

export function getProductLeathers(styleSlugs: string[]): Leather[] {
  if (styleSlugs.includes("*")) return leathers;
  const enabled = new Set(styleSlugs);
  return leathers.filter((leather) => enabled.has(leather.slug));
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await getCollection("products", ({ data }) => data.status === "active");
  return products.sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export async function getCategories(): Promise<Category[]> {
  const categories = await getCollection("categories");
  return categories.sort((a, b) => a.data.order - b.data.order);
}

export function productsInCategory(products: Product[], slug: string): Product[] {
  return products.filter((product) => product.data.categorySlugs.includes(slug));
}
