import assert from "node:assert/strict";
import test from "node:test";
import { validateCatalog } from "../scripts/validate-catalog.mjs";

test("catalog satisfies cross-file and asset invariants", () => {
  const result = validateCatalog();
  assert.equal(result.categories, 4);
  assert.equal(result.leathers, 19);
  assert.ok(result.products >= 1);
});
