"use client";

// Vstup nastavení mlýnku ve tvaru X.X.X (1Zpresso J-Ultra).
//
// Tři oddělená pole místo volného textu — díky tomu appka ví, kolik to
// je kliků, a umí porovnat dva pokusy ("o 4 kliky jemněji než minule")
// i navrhnout konkrétní posun.
import { formatGrind, type GrindSetting, describeGrindDelta } from "@/lib/grind";

type GrindInputProps = {
  value: GrindSetting;
  onChange: (value: GrindSetting) => void;
  grinderName: string;
  /** Nastavení, se kterým se porovnává (např. doporučení profilu nebo minulý pokus). */
  compareTo?: { setting: GrindSetting; label: string } | null;
  onUseSuggestion?: () => void;
};

type Part = keyof GrindSetting;

const PARTS: { key: Part; label: string; max: number }[] = [
  { key: "rotations", label: "otáčky", max: 9 },
  { key: "number", label: "číslo", max: 9 },
  { key: "clicks", label: "klik", max: 9 },
];

export function GrindInput({
  value,
  onChange,
  grinderName,
  compareTo,
  onUseSuggestion,
}: GrindInputProps) {
  function handlePartChange(part: Part, text: string) {
    // Necháme projít jen jednu číslici — mlýnek víc nemá.
    const digits = text.replace(/\D/g, "").slice(-1);
    onChange({ ...value, [part]: digits === "" ? 0 : Number(digits) });
  }

  const delta = compareTo ? describeGrindDelta(compareTo.setting, value) : null;

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-stone-200">Mletí</h2>
        <p className="text-xs text-stone-500">{grinderName}</p>
      </div>

      <div className="mt-3 flex items-end gap-2">
        {PARTS.map((part, index) => (
          <div key={part.key} className="flex items-end gap-2">
            <div>
              <label
                htmlFor={`grind-${part.key}`}
                className="block text-center text-[11px] uppercase tracking-wide text-stone-500"
              >
                {part.label}
              </label>
              <input
                id={`grind-${part.key}`}
                name={`grind${part.key[0].toUpperCase()}${part.key.slice(1)}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={String(value[part.key])}
                onChange={(event) => handlePartChange(part.key, event.target.value)}
                className="mt-1 w-14 rounded-lg border border-stone-700 bg-stone-900 px-0 py-2 text-center text-lg tabular-nums text-stone-100 outline-none focus:border-amber-600"
              />
            </div>
            {index < PARTS.length - 1 && (
              <span className="pb-2 text-lg text-stone-600">.</span>
            )}
          </div>
        ))}

        <p className="pb-2 pl-2 text-sm text-stone-500">= {formatGrind(value)}</p>
      </div>

      {compareTo && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">
            {compareTo.label}: <span className="text-stone-300">{formatGrind(compareTo.setting)}</span>
          </span>
          {delta ? (
            <span className="rounded-full bg-stone-800 px-2 py-0.5 text-amber-300">{delta}</span>
          ) : (
            <span className="text-stone-600">stejné jako teď</span>
          )}
          {delta && onUseSuggestion && (
            <button
              type="button"
              onClick={onUseSuggestion}
              className="text-amber-500 underline-offset-2 hover:underline"
            >
              použít
            </button>
          )}
        </div>
      )}
    </section>
  );
}
