import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    status: z.enum(["active", "draft"]),
    featured: z.boolean().default(false),
    categorySlugs: z.array(z.string()).min(1),
    summary: z.string().min(1),
    description: z.array(z.string().min(1)).min(1),
    price: z.object({
      amount: z.number().int().nonnegative(),
      currency: z.literal("USD"),
      compareAtAmount: z.number().int().nonnegative().nullable().optional(),
    }),
    images: z.array(imageSchema).min(1),
    styles: z.array(z.string().regex(/^(\*|[a-z0-9]+(?:-[a-z0-9]+)*)$/)).min(1).default(["*"]),
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/categories" }),
  schema: z.object({
    slug: z.enum(["north", "east", "south", "west"]),
    name: z.string().min(1),
    eyebrow: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().min(1).max(4),
    image: imageSchema,
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
});

export const collections = { products, categories };
