"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { RecipeFormState } from "@/lib/actions/recipes";
import { RatingInput } from "@/components/beans/RatingInput";
import { NumberField } from "@/components/ui/NumberField";
import { applyBrewEdit, changeDerivedField, type BrewField, type BrewValues } from "@/lib/brew-math";
import { durationToInput, parseDuration } from "@/lib/format";
import { formatGrind, shiftGrind, type GrindSetting } from "@/lib/grind";
import Link from "next/link";
import { RatioCalculator } from "./RatioCalculator";
import { GrindInput } from "./GrindInput";
import { PhaseTimer, describePhase, type TimerPhase } from "./PhaseTimer";

export type BrewMethodOption = {
  id: string;
  name: string;
  kind: "ESPRESSO" | "FILTER";
  defaultRatio: number;
  defaultDoseGrams: number | null;
};

export type PressureProfileOption = {
  id: string;
  name: string;
  description: string | null;
  methodId: string;
  defaultRatio: number | null;
  defaultDoseGrams: number | null;
  grindOffsetClicks: number | null;
  waterTempC: number | null;
  phases: TimerPhase[];
};

export type BrewFormPrefill = {
  methodId: string;
  profileId: string | null;
  doseGrams: number;
  yieldGrams: number;
  grind: GrindSetting | null;
  waterTempC: number | null;
  // Vyplněné jen při editaci existujícího receptu — nový recept tyhle
  // hodnoty nemá čím předvyplnit.
  rating?: number | null;
  notes?: string | null;
  actualTotalSeconds?: number | null;
  targetTotalSeconds?: number | null;
  bloomSeconds?: number | null;
} | null;

type BrewFormProps = {
  methods: BrewMethodOption[];
  profiles: PressureProfileOption[];
  beans: { id: string; roaster: string; coffeeName: string }[];
  initialBeanId?: string;
  settings: {
    grinderName: string;
    brewerName: string;
    defaultDoseGrams: number;
    baseGrind: GrindSetting;
  };
  /**
   * Buď poslední použitý recept na tomhle zrnku (výchozí bod pro nový
   * pokus), nebo — při editaci — přímo upravovaný recept.
   */
  prefill: BrewFormPrefill;
  /** Server akce, které se pošle formulář — nový recept, nebo úprava existujícího. */
  action: (prevState: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  submitLabel?: string;
};

/**
 * Bez vybraného receptu (žádný recept pro metodu neexistuje, nebo sis
 * zvolil "Bez receptu") appka fáze poskládá sama jen z bloomu a
 * cílového času, které zadáš ručně — bez tlaku, bez dalšího členění.
 */
function buildManualPhases(bloomText: string, totalText: string): TimerPhase[] {
  const total = parseDuration(totalText) ?? 0;
  const bloom = parseDuration(bloomText) ?? 0;

  if (bloom > 0 && bloom < total) {
    return [
      { label: "Bloom", targetBarMin: null, targetBarMax: null, durationSeconds: bloom, note: "Zalij dvojnásobek dávky a nech odplynit." },
      { label: "Extrakce", targetBarMin: null, targetBarMax: null, durationSeconds: total - bloom, note: null },
    ];
  }

  return [
    { label: "Extrakce", targetBarMin: null, targetBarMax: null, durationSeconds: total, note: null },
  ];
}

export function BrewForm({
  methods,
  profiles,
  beans,
  initialBeanId,
  settings,
  prefill,
  action,
  submitLabel = "Uložit recept",
}: BrewFormProps) {
  const [state, formAction] = useActionState(action, { error: null });

  const initialMethod =
    methods.find((m) => m.id === prefill?.methodId) ??
    methods.find((m) => m.kind === "ESPRESSO") ??
    methods[0];

  const [methodId, setMethodId] = useState(initialMethod?.id ?? "");
  const method = methods.find((m) => m.id === methodId) ?? initialMethod;
  const isEspresso = method?.kind === "ESPRESSO";

  const methodProfiles = profiles.filter((p) => p.methodId === methodId);
  const [profileId, setProfileId] = useState<string | null>(
    prefill?.profileId ?? methodProfiles[0]?.id ?? null,
  );
  const profile = methodProfiles.find((p) => p.id === profileId) ?? null;

  const initialDose =
    prefill?.doseGrams ?? method?.defaultDoseGrams ?? settings.defaultDoseGrams;
  const initialRatio = prefill
    ? prefill.yieldGrams / prefill.doseGrams
    : (profile?.defaultRatio ?? method?.defaultRatio ?? 2);

  const [values, setValues] = useState<BrewValues>({
    dose: String(initialDose),
    yield: String(Number((initialDose * initialRatio).toFixed(1))),
    ratio: String(Number(initialRatio.toFixed(3))),
  });
  const [derived, setDerived] = useState<BrewField>("yield");

  const [grind, setGrind] = useState<GrindSetting>(prefill?.grind ?? settings.baseGrind);
  const [waterTemp, setWaterTemp] = useState(
    String(prefill?.waterTempC ?? profile?.waterTempC ?? ""),
  );
  // Časy držíme jako text ("32" i "2:45") — na sekundy je převede až
  // validace při ukládání (viz lib/validation/recipe.ts). Při editaci se
  // předvyplní z upravovaného receptu, jinak zůstávají prázdné/výchozí.
  const [actualTime, setActualTime] = useState(
    prefill?.actualTotalSeconds != null ? durationToInput(prefill.actualTotalSeconds) : "",
  );
  // Bez vybraného receptu si cílový čas a bloom zadáváš sám; s receptem
  // je oboje dané jeho fázemi.
  const [manualTargetTime, setManualTargetTime] = useState(
    prefill?.targetTotalSeconds != null ? durationToInput(prefill.targetTotalSeconds) : "2:30",
  );
  const [manualBloomTime, setManualBloomTime] = useState(
    prefill?.bloomSeconds != null ? durationToInput(prefill.bloomSeconds) : "30",
  );

  // Recept doporučuje posun mletí oproti tvému běžnému espresso
  // nastavení — turbo shot výrazně hrubší, klasika beze změny.
  const suggestedGrind =
    profile?.grindOffsetClicks != null
      ? shiftGrind(settings.baseGrind, profile.grindOffsetClicks)
      : null;

  function handleMethodChange(id: string) {
    setMethodId(id);
    const nextMethod = methods.find((m) => m.id === id);
    const nextProfile = profiles.find((p) => p.methodId === id) ?? null;
    setProfileId(nextProfile?.id ?? null);
    applyDefaults(
      nextProfile?.defaultDoseGrams ?? nextMethod?.defaultDoseGrams ?? settings.defaultDoseGrams,
      nextProfile?.defaultRatio ?? nextMethod?.defaultRatio ?? 2,
    );
    if (nextProfile?.waterTempC != null) setWaterTemp(String(nextProfile.waterTempC));
  }

  // `id === null` znamená "Bez receptu" — appka nechá aktuální hodnoty
  // být a přepne na ruční zadání cílového času a bloomu.
  function handleProfileChange(id: string | null) {
    setProfileId(id);
    if (id === null) return;
    const next = methodProfiles.find((p) => p.id === id);
    if (!next) return;
    applyDefaults(
      next.defaultDoseGrams ?? settings.defaultDoseGrams,
      next.defaultRatio ?? method?.defaultRatio ?? 2,
    );
    if (next.waterTempC != null) setWaterTemp(String(next.waterTempC));
    if (next.grindOffsetClicks != null) {
      setGrind(shiftGrind(settings.baseGrind, next.grindOffsetClicks));
    }
  }

  function applyDefaults(dose: number, ratio: number) {
    setDerived("yield");
    setValues({
      dose: String(dose),
      yield: String(Number((dose * ratio).toFixed(1))),
      ratio: String(Number(ratio.toFixed(3))),
    });
  }

  // Fáze pro časovač: podle vybraného receptu, jinak ze zadaného bloomu
  // a cílového času.
  const timerPhases: TimerPhase[] = profile
    ? profile.phases
    : buildManualPhases(manualBloomTime, manualTargetTime);

  const targetSeconds = timerPhases.reduce((sum, phase) => sum + phase.durationSeconds, 0);

  return (
    <form action={formAction} className="space-y-5">
      {initialBeanId ? (
        <input type="hidden" name="beanId" value={initialBeanId} />
      ) : (
        <div>
          <label htmlFor="beanId" className="block text-sm font-medium text-stone-300">
            Zrnko
          </label>
          <select
            id="beanId"
            name="beanId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-600"
          >
            <option value="" disabled>
              Vyber zrnko…
            </option>
            {beans.map((bean) => (
              <option key={bean.id} value={bean.id}>
                {bean.roaster} — {bean.coffeeName}
              </option>
            ))}
          </select>
        </div>
      )}

      <input type="hidden" name="methodId" value={methodId} />
      <input type="hidden" name="profileId" value={profileId ?? ""} />
      <input type="hidden" name="ratio" value={values.ratio} />

      {/* Metoda — espresso je hlavní, filtr vedle. */}
      <div className="flex flex-wrap gap-2">
        {methods.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleMethodChange(option.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              option.id === methodId
                ? "bg-amber-700 font-medium text-white"
                : "border border-stone-700 text-stone-400 hover:bg-stone-800"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>

      {methodProfiles.length > 0 && (
        <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-stone-200">Recept</h2>
            <Link href="/profiles" className="text-xs text-amber-500 hover:underline">
              Spravovat recepty
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            <label
              className={`block cursor-pointer rounded-lg border p-3 transition ${
                profileId === null
                  ? "border-amber-700 bg-amber-950/30"
                  : "border-stone-800 hover:border-stone-700"
              }`}
            >
              <input
                type="radio"
                name="profileChoice"
                value=""
                checked={profileId === null}
                onChange={() => handleProfileChange(null)}
                className="sr-only"
              />
              <span
                className={`text-sm font-medium ${
                  profileId === null ? "text-amber-300" : "text-stone-200"
                }`}
              >
                Bez receptu (ručně)
              </span>
            </label>
            {methodProfiles.map((option) => (
              <label
                key={option.id}
                className={`block cursor-pointer rounded-lg border p-3 transition ${
                  option.id === profileId
                    ? "border-amber-700 bg-amber-950/30"
                    : "border-stone-800 hover:border-stone-700"
                }`}
              >
                <input
                  type="radio"
                  name="profileChoice"
                  value={option.id}
                  checked={option.id === profileId}
                  onChange={() => handleProfileChange(option.id)}
                  className="sr-only"
                />
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={`text-sm font-medium ${
                      option.id === profileId ? "text-amber-300" : "text-stone-200"
                    }`}
                  >
                    {option.name}
                  </span>
                  {option.defaultRatio && (
                    <span className="shrink-0 text-xs tabular-nums text-stone-500">
                      1:{option.defaultRatio}
                    </span>
                  )}
                </div>
                {option.description && (
                  <p className="mt-1 text-xs leading-relaxed text-stone-400">{option.description}</p>
                )}
                {option.id === profileId && option.phases.length > 0 && (
                  <p className="mt-2 text-xs text-stone-500">
                    {option.phases.map((phase) => `${phase.label} ${describePhase(phase)}`).join(" → ")}
                  </p>
                )}
              </label>
            ))}
          </div>
        </section>
      )}

      <RatioCalculator
        values={values}
        derived={derived}
        onEdit={(field, text) => setValues((current) => applyBrewEdit(current, derived, field, text))}
        onDerivedChange={(field) => {
          setDerived(field);
          setValues((current) => changeDerivedField(current, field));
        }}
        labels={
          isEspresso
            ? { dose: "Dávka", yield: "Výdej", ratio: "Poměr (1:N)" }
            : { dose: "Káva", yield: "Voda", ratio: "Poměr (1:N)" }
        }
      />

      {/* Skrytá pole, aby se do akce dostaly dopočítané hodnoty i z read-only polí. */}
      <input type="hidden" name="doseGrams" value={values.dose} />
      <input type="hidden" name="yieldGrams" value={values.yield} />

      <GrindInput
        value={grind}
        onChange={setGrind}
        grinderName={settings.grinderName}
        compareTo={
          suggestedGrind
            ? { setting: suggestedGrind, label: `Doporučeno pro ${profile?.name}` }
            : prefill?.grind
              ? { setting: prefill.grind, label: "Minule" }
              : null
        }
        onUseSuggestion={
          suggestedGrind ? () => setGrind(suggestedGrind) : undefined
        }
      />

      <div className={`grid gap-4 ${profile ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <NumberField
          id="waterTempC"
          name="waterTempC"
          label="Teplota vody"
          value={waterTemp}
          onChange={setWaterTemp}
          suffix="°C"
        />
        {profile ? (
          <NumberField
            id="targetTotalSeconds"
            name="targetTotalSeconds"
            label="Cílový čas"
            value={durationToInput(targetSeconds)}
            readOnly
            hint="Součet fází receptu"
          />
        ) : (
          <>
            <NumberField
              id="targetTotalSeconds"
              name="targetTotalSeconds"
              label="Cílový čas"
              value={manualTargetTime}
              onChange={setManualTargetTime}
              placeholder="např. 2:30"
            />
            <NumberField
              id="bloomSeconds"
              name="bloomSeconds"
              label="Bloom"
              value={manualBloomTime}
              onChange={setManualBloomTime}
              suffix="s"
              hint="0 = bez bloomu"
            />
          </>
        )}
      </div>

      {/* S vybraným receptem je bloom součástí jeho fází — uložíme délku první fáze. */}
      {profile && (
        <input
          type="hidden"
          name="bloomSeconds"
          value={timerPhases[0]?.durationSeconds ?? ""}
        />
      )}

      <PhaseTimer phases={timerPhases} onStop={(seconds) => setActualTime(durationToInput(seconds))} />

      <NumberField
        id="actualTotalSeconds"
        name="actualTotalSeconds"
        label="Skutečný čas"
        value={actualTime}
        onChange={setActualTime}
        placeholder="např. 32 nebo 2:45"
        hint="Vyplní se sám po zastavení časovače, jde přepsat."
      />

      <RatingInput name="rating" label="Hodnocení šálku" defaultValue={prefill?.rating ?? null} />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-stone-300">
          Poznámky
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={prefill?.notes ?? ""}
          placeholder="Chuť, co příště zkusit…"
          className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-600"
        />
      </div>

      <p className="text-xs text-stone-600">
        Uloží se s vybavením:{" "}
        {/* Kávovar dává smysl zmiňovat jen u espressa — filtr se na páce nedělá. */}
        {isEspresso && `${settings.brewerName} · `}
        {settings.grinderName} · mletí {formatGrind(grind)}
      </p>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-amber-700 px-4 py-3 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
    >
      {pending ? "Ukládám…" : label}
    </button>
  );
}
