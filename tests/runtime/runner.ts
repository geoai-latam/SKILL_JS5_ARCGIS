// Loads tests/runtime/casos/<caso>.ts and publishes its result on window.__result.
// Each caso exports `run(container)` and returns a list of {check, ok, detail}.
const caso = new URLSearchParams(location.search).get("caso");
const casos = import.meta.glob("./casos/*.ts");
(async () => {
  const w = window as unknown as { __result: unknown };
  try {
    const load = casos[`./casos/${caso}.ts`];
    if (!load) throw new Error(`no existe el caso ${caso}`);
    const mod = (await load()) as { run: (el: HTMLElement) => Promise<unknown> };
    w.__result = { ok: true, checks: await mod.run(document.getElementById("view")!) };
  } catch (e) {
    w.__result = { ok: false, error: String((e as Error)?.stack ?? e) };
  }
})();
