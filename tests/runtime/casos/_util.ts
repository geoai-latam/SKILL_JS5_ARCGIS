export type Check = { check: string; ok: boolean; detail: string };

const TOPE_MS = 40000;

export async function intento(check: string, fn: () => Promise<string | void>): Promise<Check> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const tope = new Promise<never>((_, no) => { reloj = setTimeout(() => no(new Error(`sin respuesta en ${TOPE_MS / 1000} s`)), TOPE_MS); });
  try { return { check, ok: true, detail: (await Promise.race([fn(), tope])) ?? "" }; }
  catch (e) { return { check, ok: false, detail: String((e as Error)?.message ?? e) }; }
  finally { clearTimeout(reloj); }
}

/** A check that passes when `fn` throws: it proves the wrong pattern a skill warns about fails. */
export async function invertido(check: string, fn: () => Promise<string | void>): Promise<Check> {
  const r = await intento(check, fn);
  if (!r.ok && r.detail.startsWith("sin respuesta")) return { check, ok: false, detail: `no concluyente: ${r.detail}` };
  return { check, ok: !r.ok, detail: r.ok ? `no falló: ${r.detail}` : `falla, como se esperaba: ${r.detail}` };
}
