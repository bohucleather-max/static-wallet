import site from "../data/site.json";

const formatter = new Intl.NumberFormat(site.pricing.locale, {
  style: "currency",
  currency: site.pricing.currency,
});

export function formatPrice(cents: number): string {
  return formatter.format(cents / 100);
}
