"use client";

// Editor fází receptu — přidávání, mazání a přeřazování řádků. Tlaková
// pole (bar) se zobrazují jen pro espresso recepty; u filtru fáze mají
// jen název, délku a volitelnou poznámku.
const inputClass =
  "w-full rounded-lg border border-stone-700 bg-stone-900 px-2 py-1.5 text-sm text-stone-100 outline-none focus:border-amber-600";

export type PhaseDraft = {
  label: string;
  targetBarMin: string;
  targetBarMax: string;
  durationSeconds: string;
  note: string;
};

export function emptyPhase(): PhaseDraft {
  return { label: "", targetBarMin: "", targetBarMax: "", durationSeconds: "", note: "" };
}

type PhaseEditorProps = {
  phases: PhaseDraft[];
  onChange: (phases: PhaseDraft[]) => void;
  showPressure: boolean;
};

export function PhaseEditor({ phases, onChange, showPressure }: PhaseEditorProps) {
  function update(index: number, patch: Partial<PhaseDraft>) {
    onChange(phases.map((phase, i) => (i === index ? { ...phase, ...patch } : phase)));
  }

  function remove(index: number) {
    onChange(phases.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= phases.length) return;
    const next = [...phases];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-stone-200">Fáze časovače</h2>
        <p className="text-xs text-stone-500">Appka tě jimi provede při vaření.</p>
      </div>

      <input type="hidden" name="phasesJson" value={JSON.stringify(phases)} />

      {phases.length === 0 && (
        <p className="mt-3 text-sm text-stone-500">Zatím žádná fáze — přidej první tlačítkem níže.</p>
      )}

      <div className="mt-3 space-y-3">
        {phases.map((phase, index) => (
          <div key={index} className="rounded-lg border border-stone-800 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-stone-500">Fáze {index + 1}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Posunout výš"
                  className="text-stone-400 hover:text-stone-200 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === phases.length - 1}
                  aria-label="Posunout níž"
                  className="text-stone-400 hover:text-stone-200 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Smazat
                </button>
              </div>
            </div>

            <div className={`mt-2 grid gap-2 ${showPressure ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
              <div className={showPressure ? "sm:col-span-2" : ""}>
                <label className="block text-xs text-stone-500">Název fáze</label>
                <input
                  type="text"
                  value={phase.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                  placeholder="např. Preinfuze"
                  className={`mt-1 ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500">Délka</label>
                <input
                  type="text"
                  inputMode="text"
                  value={phase.durationSeconds}
                  onChange={(e) => update(index, { durationSeconds: e.target.value })}
                  placeholder="30 nebo 1:30"
                  className={`mt-1 ${inputClass}`}
                />
              </div>
              {showPressure && (
                <div>
                  <label className="block text-xs text-stone-500">Tlak (bar)</label>
                  <div className="mt-1 flex items-center gap-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={phase.targetBarMin}
                      onChange={(e) => update(index, { targetBarMin: e.target.value })}
                      placeholder="min"
                      className={inputClass}
                    />
                    <span className="text-stone-600">–</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={phase.targetBarMax}
                      onChange={(e) => update(index, { targetBarMax: e.target.value })}
                      placeholder="max"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2">
              <label className="block text-xs text-stone-500">Poznámka (nepovinné)</label>
              <input
                type="text"
                value={phase.note}
                onChange={(e) => update(index, { note: e.target.value })}
                placeholder="Co udělat v týhle fázi"
                className={`mt-1 ${inputClass}`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...phases, emptyPhase()])}
        className="mt-3 rounded-lg border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-800"
      >
        + Přidat fázi
      </button>
    </section>
  );
}
