export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function tab(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = new Map(); const errs = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errs.push(String(d.params.exceptionDetails.exception?.description || '').slice(0, 200));
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push(JSON.stringify(d.params.args.map(a => a.value ?? a.description)).slice(0, 200)); };
  // Con tope de 60 s: si la pestaña o el Chrome se cae a mitad, la prueba falla en vez de quedarse colgada (28-10-2026)
  const send = (method, params = {}) => Promise.race([new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); }), sleep(60000).then(() => ({ result: { exceptionDetails: { exception: { description: 'timeout CDP 60 s' } } } }))]);
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r.result?.result?.value ?? ('ERR ' + (r.result?.exceptionDetails?.exception?.description || JSON.stringify(r.result?.result))); };
  await send('Runtime.enable');
  return { ws, send, ev, errs, async go(url, wait = 7000) { await send('Page.navigate', { url }); await sleep(wait); }, close() { ws.close(); fetch(`http://127.0.0.1:${port}/json/close/${t.id}`).catch(() => {}); } };
}
