// mergeheap.js：候选源与取值
export function nextOf(sources, cursors) {
  let best = null;
  let bestValue = 0;
  const names = Object.keys(sources || {}).sort();
  for (const name of names) {
    const data = sources[name] || [];
    const cursor = (cursors && cursors[name]) || 0;
    if (cursor >= data.length) continue;
    const value = data[cursor];
    if (best === null || value < bestValue) {
      best = name;
      bestValue = value;
    }
  }
  return best;
}

export function valueOf(sources, cursors, source) {
  const data = (sources && sources[source]) || [];
  const cursor = (cursors && cursors[source]) || 0;
  return cursor < data.length ? data[cursor] : 0;
}
