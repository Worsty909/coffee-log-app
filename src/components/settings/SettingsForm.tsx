"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettings } from "@/lib/actions/settings";

type SettingsFormProps = {
  settings: {
    grinderName: string;
    brewerName: string;
    basketName: string;
    screenName: string;
    defaultDoseGrams: number;
    baseGrindRotations: number;
    baseGrindNumber: number;
    baseGrindClicks: number;
  };
};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction] = useActionState(updateSettings, { error: null, saved: false });

  return (
    <form action={formAction} className="space-y-5">
      <section className="space-y-4 rounded-xl border border-stone-800 bg-stone-900/60 p-4">
        <h2 className="text-sm font-semibold text-stone-200">Vybavení</h2>
        <TextField label="Kávovar" name="brewerName" defaultValue={settings.brewerName} />
        <TextField label="Mlýnek" name="grinderName" defaultValue={settings.grinderName} />
        <TextField label="Filtrační koš" name="basketName" defaultValue={settings.basketName} />
        <TextField label="Puck screen" name="screenName" defaultValue={settings.screenName} />
      </section>

      <section className="space-y-4 rounded-xl border border-stone-800 bg-stone-900/60 p-4">
        <div>
          <h2 className="text-sm font-semibold text-stone-200">Výchozí hodnoty</h2>
          <p className="mt-1 text-xs text-stone-500">
            Od běžného nastavení mlýnku se odvozují doporučené posuny jednotlivých profilů
            (turbo shot hrubší, klasika beze změny).
          </p>
        </div>

        <div className="w-40">
          <TextField
            label="Výchozí dávka (g)"
            name="defaultDoseGrams"
            defaultValue={String(settings.defaultDoseGrams)}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-stone-300">Běžné espresso mletí</p>
          <div className="mt-1 flex items-end gap-2">
            <GrindPart label="otáčky" name="baseGrindRotations" defaultValue={settings.baseGrindRotations} />
            <span className="pb-2 text-lg text-stone-600">.</span>
            <GrindPart label="číslo" name="baseGrindNumber" defaultValue={settings.baseGrindNumber} />
            <span className="pb-2 text-lg text-stone-600">.</span>
            <GrindPart label="klik" name="baseGrindClicks" defaultValue={settings.baseGrindClicks} />
          </div>
        </div>
      </section>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.saved && !state.error && <p className="text-sm text-emerald-400">Uloženo.</p>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
    >
      {pending ? "Ukládám…" : "Uložit nastavení"}
    </button>
  );
}

function TextField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-stone-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        autoComplete="off"
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-600"
      />
    </div>
  );
}

function GrindPart({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-center text-[11px] uppercase tracking-wide text-stone-500"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={1}
        defaultValue={String(defaultValue)}
        className="mt-1 w-14 rounded-lg border border-stone-700 bg-stone-900 py-2 text-center text-lg tabular-nums text-stone-100 outline-none focus:border-amber-600"
      />
    </div>
  );
}
