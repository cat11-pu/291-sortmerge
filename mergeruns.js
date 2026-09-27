// mergeruns.js：按输出预算吐数，预算用尽压账，收尾不限预算清账
import { nextOf, valueOf } from "./mergeheap.js";

function fault(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function eventCode(spec) {
  return spec.event_error_code || "E_BAD_EVENT";
}

function exhaustedCode(spec) {
  return spec.exhausted_error_code || "E_EXHAUSTED";
}

function freshState(spec) {
  const state = spec.state || {};
  const cursors = Object.assign({}, state.cursors);
  Object.keys(spec.sources || {}).forEach(function (name) {
    if (typeof cursors[name] !== "number") cursors[name] = 0;
  });
  return {
    cursors: cursors,
    out: (state.out || []).slice(),
    ledger: (state.ledger || []).slice(),
    applied: (state.applied || []).slice()
  };
}

function checkEvent(spec, event) {
  if (!event || typeof event !== "object" || event.kind !== "merge") {
    throw fault(eventCode(spec), "bad event");
  }
}

function emitOne(spec, state) {
  const name = nextOf(spec.sources, state.cursors);
  if (name === null) {
    throw fault(exhaustedCode(spec), "sources exhausted");
  }
  state.out.push(valueOf(spec.sources, state.cursors, name));
  state.cursors[name] += 1;
}

export function step(spec) {
  const state = freshState(spec);
  const events = spec.events || [];
  let budget = typeof spec.budget === "number" ? spec.budget : 0;
  let served = 0;
  let judged = 0;
  events.forEach(function (event, index) {
    checkEvent(spec, event);
    const id = event.id !== undefined ? event.id : index;
    if (state.applied.indexOf(id) !== -1) return;
    state.applied.push(id);
    judged += 1;
    if (budget > 0) {
      budget -= 1;
      emitOne(spec, state);
      served += 1;
    } else {
      state.ledger.push(id);
    }
  });
  return {
    state: state,
    served: served,
    ledger_before: state.ledger.length,
    ledger: state.ledger.slice(),
    judged: judged,
    judged_bound: events.length
  };
}

export function close(spec) {
  const state = freshState(spec);
  let catchup = 0;
  while (state.ledger.length > 0) {
    state.ledger.shift();
    emitOne(spec, state);
    catchup += 1;
  }
  return { state: state, catchup: catchup };
}
