"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { createRecipe } from "@/lib/actions/recipes";
import { RatingInput } from "@/components/beans/RatingInput";
import { BrewTimer } from "./BrewTimer";

type Method = { id: string; name: string; defaultRatio: number };
type Bean = { id: string; roaster: string; coffeeName: string };

type BrewCalculatorFormProps = {
  methods: Method[];
  beans: Bean[];
  initialBeanId?: string;
  // Předvyplnění z posledního použitého receptu na tomhle zrnku
  // (viz src/lib/actions/lastRecipe.ts) — pokud appka žádný nezná,
  // zůstanou výchozí hodnoty kalkulačky.
  prefill?: {
    methodId: string;
    ratio: number;
    coffeeGrams: number;
    waterGrams: number;
    grindSetting: string | null;
    waterTempC: number | null;
    bloomSeconds: number | null;
  } | null;
};

const ML_PER_CUP = 240;
const DEFAULT_COFFEE_GRAMS = 15;
const DEFAULT_BLOOM_SECONDS = 30;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function BrewCalculatorForm({ methods, beans, initialBeanId, prefill }: BrewCalculatorFormProps) {
  const [state, formAction] = useActionState(createRecipe, { error: null });

  const initialMethod =
    methods.find((m) => m.id === prefill?.methodId) ?? methods[0] ?? null;

  const [methodId, setMethodId] = useState(initialMethod?.id ?? "");
  const [ratio, setRatio] = useState(prefill?.ratio ?? initialMethod?.defaultRatio ?? 16);
  const [coffeeGrams, setCoffeeGrams] = useState(prefill?.coffeeGrams ?? DEFAULT_COFFEE_GRAMS);
  const [waterGrams, setWaterGrams] = useState(
    prefill?.waterGrams ?? round1(DEFAULT_COFFEE_GRAMS * (prefill?.ratio ?? initialMethod?.defaultRatio ?? 16)),
  );
  const [bloomSeconds, setBloomSeconds] = useState(prefill?.bloomSeconds ?? DEFAULT_BLOOM_SECONDS);
  const [actualTotalSeconds, setActualTotalSeconds] = useState<number | null>(null);

  const selectedMethod = useMemo(() => methods.find((m) => m.id === methodId), [methods, methodId]);

  function handleMethodChange(id: string) {
    setMethodId(id);
    const method = methods.find((m) => m.id === id);
    if (method) {
      setRatio(method.defaultRatio);
      setWaterGrams(round1(coffeeGrams * method.defaultRatio));
    }
  }

  function handleRatioChange(value: number) {
    setRatio(value);
    setWaterGrams(round1(coffeeGrams * value));
  }

  function handleCoffeeChange(value: number) {
    setCoffeeGrams(value);
    setWaterGrams(round1(value * ratio));
  }

  function handleWaterChange(value: number) {
    setWaterGrams(value);
    setCoffeeGrams(round1(value / ratio));
  }

  function handleCupsChange(cups: number) {
    const water = round1(cups * ML_PER_CUP);
    setWaterGrams(water);
    setCoffeeGrams(round1(water / ratio));
  }

  const actualMinutes = actualTotalSeconds !== null ? Math.floor(actualTotalSeconds / 60) : "";
  const actualSecondsPart = actualTotalSeconds !== null ? actualTotalSeconds % 60 : "";

  return (
    <form action={formAction} className="space-y-6">
      {initialBeanId ? (
        <input type="hidden" name="beanId" value={initialBeanId} />
      ) : (
        <div>
          <label htmlFor="beanId" className="block text-sm font-medium text-neutral-700">
            Zrnko
          </label>
          <select
            id="beanId"
            name="beanId"
            required
            defaultValue=""
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
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

      <div>
        <label htmlFor="methodId" className="block text-sm font-medium text-neutral-700">
          Metoda přípravy
        </label>
        <select
          id="methodId"
          name="methodId"
          value={methodId}
          onChange={(e) => handleMethodChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          {methods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name} (výchozí 1:{method.defaultRatio})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          label="Poměr (1:N)"
          name="ratio"
          value={ratio}
          step={0.5}
          onChange={handleRatioChange}
        />
        <NumberField
          label="Káva (g)"
          name="coffeeGrams"
          value={coffeeGrams}
          step={0.5}
          onChange={handleCoffeeChange}
        />
        <NumberField
          label="Voda (ml)"
          name="waterGrams"
          value={waterGrams}
          step={1}
          onChange={handleWaterChange}
        />
      </div>

      <div>
        <label htmlFor="cups" className="block text-sm font-medium text-neutral-700">
          Nebo spočítat z počtu šálků (á {ML_PER_CUP} ml)
        </label>
        <input
          id="cups"
          type="number"
          min={0}
          step={0.5}
          placeholder="např. 2"
          onChange={(e) => {
            const cups = Number(e.target.value);
            if (cups > 0) handleCupsChange(cups);
          }}
          className="mt-1 w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        {selectedMethod && (
          <p className="mt-1 text-xs text-neutral-500">
            Výchozí poměr pro {selectedMethod.name}: 1:{selectedMethod.defaultRatio}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="grindSetting" className="block text-sm font-medium text-neutral-700">
            Hrubost mletí (nepovinné)
          </label>
          <input
            id="grindSetting"
            name="grindSetting"
            placeholder="např. Comandante 25 kliků"
            defaultValue={prefill?.grindSetting ?? ""}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="waterTempC" className="block text-sm font-medium text-neutral-700">
            Teplota vody (°C, nepovinné)
          </label>
          <input
            id="waterTempC"
            name="waterTempC"
            type="number"
            step="1"
            defaultValue={prefill?.waterTempC ?? undefined}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bloomSeconds" className="block text-sm font-medium text-neutral-700">
          Cílová délka bloom fáze (s)
        </label>
        <input
          id="bloomSeconds"
          name="bloomSeconds"
          type="number"
          min={0}
          value={bloomSeconds}
          onChange={(e) => setBloomSeconds(Number(e.target.value))}
          className="mt-1 w-32 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-neutral-700">Cílová celková doba (nepovinné)</p>
        <TimeInputPair minutesName="targetTotalMinutes" secondsName="targetTotalSecondsPart" />
      </div>

      <div>
        <p className="block text-sm font-medium text-neutral-700">Časovač přípravy</p>
        <p className="mb-2 text-xs text-neutral-500">
          Spusť při zalévání kávy — po zastavení appka sama vyplní skutečnou dobu níže.
        </p>
        <BrewTimer bloomSeconds={bloomSeconds} onStop={setActualTotalSeconds} />
      </div>

      <div>
        <p className="block text-sm font-medium text-neutral-700">Skutečná celková doba</p>
        <TimeInputPair
          minutesName="actualTotalMinutes"
          secondsName="actualTotalSecondsPart"
          minutesValue={actualMinutes}
          secondsValue={actualSecondsPart}
        />
      </div>

      <RatingInput name="rating" label="Hodnocení výsledného šálku" defaultValue={null} />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Poznámky k receptu
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}

function NumberField({
  label,
  name,
  value,
  step,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        step={step}
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function TimeInputPair({
  minutesName,
  secondsName,
  minutesValue,
  secondsValue,
}: {
  minutesName: string;
  secondsName: string;
  minutesValue?: number | "";
  secondsValue?: number | "";
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        name={minutesName}
        type="number"
        min={0}
        placeholder="min"
        {...(minutesValue !== undefined ? { value: minutesValue } : {})}
        readOnly={minutesValue !== undefined}
        className="w-20 rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <span className="text-neutral-500">min</span>
      <input
        name={secondsName}
        type="number"
        min={0}
        max={59}
        placeholder="s"
        {...(secondsValue !== undefined ? { value: secondsValue } : {})}
        readOnly={secondsValue !== undefined}
        className="w-20 rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <span className="text-neutral-500">s</span>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
    >
      {pending ? "Ukládám…" : "Uložit recept"}
    </button>
  );
}
