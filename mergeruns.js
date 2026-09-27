// mergeruns.js：按输出预算吐数并留账（基线：一律给空表）
import { nextOf, valueOf } from "./mergeheap.js";

export function step(spec) {
  return { state: spec.state, served: 0, ledger_before: 0, ledger: [], judged: 0, judged_bound: 0 };
}

export function close(spec) {
  return { state: spec.state, catchup: 0 };
}
