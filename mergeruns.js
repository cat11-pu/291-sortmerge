// mergeruns.js：按输出预算吐数并留账
import { nextOf, valueOf } from "./mergeheap.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function eventCode(spec) {
  return spec.event_error_code || "E_BAD_EVENT";
}

function exhaustedCode(spec) {
  return spec.exhausted_error_code || "E_EXHAUSTED";
}

function checkEvent(spec, event) {
  if (!event || typeof event !== "object" || event.kind !== "merge" || event.id === undefined) {
    fail(eventCode(spec), "bad event");
  }
}

function copyState(state) {
  return {
    cursors: Object.assign({}, state.cursors),
    out: state.out.slice(),
    ledger: state.ledger.slice(),
    applied: state.applied.slice()
  };
}

function emitOne(spec, state) {
  const name = nextOf(spec.sources, state.cursors);
  if (name === null) {
    fail(exhaustedCode(spec), "sources exhausted");
  }
  state.out.push(valueOf(spec.sources, state.cursors, name));
  state.cursors[name] += 1;
}

export function step(spec) {
  const state = copyState(spec.state);
  const events = spec.events || [];
  let budget = spec.budget == null ? 0 : spec.budget;
  const applied = new Set(state.applied);
  let served = 0;
  let judged = 0;
  while (budget > 0 && state.ledger.length > 0) {
    state.ledger.shift();
    emitOne(spec, state);
    served += 1;
    budget -= 1;
  }
  for (const event of events) {
    checkEvent(spec, event);
    judged += 1;
    if (applied.has(event.id)) continue;
    applied.add(event.id);
    state.applied.push(event.id);
    if (budget > 0) {
      emitOne(spec, state);
      served += 1;
      budget -= 1;
    } else {
      state.ledger.push(event.id);
    }
  }
  return { state: state, served: served, ledger_before: state.ledger.length,
           ledger: state.ledger.slice(), judged: judged, judged_bound: events.length };
}

export function close(spec) {
  const state = copyState(spec.state);
  let catchup = 0;
  while (state.ledger.length > 0) {
    state.ledger.shift();
    emitOne(spec, state);
    catchup += 1;
  }
  return { state: state, catchup: catchup };
}
