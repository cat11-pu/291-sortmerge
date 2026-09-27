import assert from "node:assert";
import { nextOf, valueOf } from "../mergeheap.js";
import { step, close } from "../mergeruns.js";
import { render } from "../app.js";

const base = {
  budget: 2, sources: { s1: [1] },
  state: { cursors: { s1: 0 }, out: [], ledger: [], applied: [] },
  events: [],
  exhausted_error_code: "E_EXHAUSTED", event_error_code: "E_BAD_EVENT"
};

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("nextOf returns a source or empty", () => {
  const value = nextOf(base.sources, base.state.cursors);
  assert.ok(value === null || typeof value === "string");
});

check("valueOf returns a number", () => {
  assert.strictEqual(typeof valueOf(base.sources, base.state.cursors, "s1"), "number");
});

check("step returns a state", () => {
  assert.strictEqual(typeof step(base).state, "object");
});

check("close returns a state", () => {
  assert.strictEqual(typeof close(base).state, "object");
});

check("render counts events", () => {
  assert.strictEqual(typeof render(base).count, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
