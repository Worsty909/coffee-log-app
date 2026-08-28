"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createProfile, type ProfileFormState } from "@/lib/actions/profiles";
import { PhaseEditor, emptyPhase, type PhaseDraft } from "./PhaseEditor";

export type MethodOption = { id: string; name: string; kind: "ESPRESSO" | "FILTER" };

export type ProfileFormValues = {
  name: string;
  description: string | null;
  methodId: string;
  defaultRatio: number | null;
  defaultDoseGrams: number | null;
  grindOffsetClicks: number | null;
  waterTempC: number | null;
  phases: {
    label: string;
    targetBarMin: number | null;
    targetBarMax: number | null;
    durationSeconds: number;
    note: string | null;
  }[];
};

type ProfileFormProps = {
  methods: MethodOption[];
  initialValues?: ProfileFormValues;
  /** Předvybraná metoda pro nový recept (z odkazu "+ Přidat" u konkrétní metody). */
  initialMethodId?: string;
  action?: (prevState: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  submitLabel?: string;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-600";

function toDraftPhases(values: ProfileFormValues["phases"] | undefined): PhaseDraft[] {
  if (!values || values.length === 0) return [emptyPhase()];
  return values.map((phase) => ({
    label: phase.label,
    targetBarMin: phase.targetBarMin != null ? String(phase.targetBarMin) : "",
    targetBarMax: phase.targetBarMax != null ? String(phase.targetBarMax) : "",
    durationSeconds: String(phase.durationSeconds),
    note: phase.note ?? "",
  }));
}

export function ProfileForm({
  methods,
  initialValues,
  initialMethodId,
  action = createProfile,
  submitLabel = "Uložit recept",
}: ProfileFormProps) {
  const [state, formAction] = useActionState(action, { error: null });

  const [methodId, setMethodId] = useState(
    initialValues?.methodId ?? initialMethodId ?? methods[0]?.id ?? "",
  );
  const method = methods.find((m) => m.id === methodId);
  const showPressure = method?.kind === "ESPRESSO";

  const [phases, setPhases] = useState<PhaseDraft[]>(toDraftPhases(initialValues?.phases));

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-300">
            Název receptu
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={initialValues?.name}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="methodId" className="block text-sm font-medium text-stone-300">
            Metoda přípravy
          </label>
          <select
            id="methodId"
            name="methodId"
            value={methodId}
            onChange={(e) => setMethodId(e.target.value)}
            className={inputClass}
          >
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-300">
          Popis (nepovinné)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={initialValues?.description ?? ""}
          placeholder="K čemu je tenhle recept dobrý, na co si dát pozor…"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="defaultRatio"
          name="defaultRatio"
          label="Výchozí poměr (1:N, nepovinné)"
          defaultValue={initialValues?.defaultRatio}
        />
        <TextField
          id="defaultDoseGrams"
          name="defaultDoseGrams"
          label="Výchozí dávka (g, nepovinné)"
          defaultValue={initialValues?.defaultDoseGrams}
        />
        <TextField
          id="grindOffsetClicks"
          name="grindOffsetClicks"
          label="Posun mletí (kliky, nepovinné)"
          defaultValue={initialValues?.grindOffsetClicks}
          hint="Kladné = hrubší oproti běžnému nastavení"
        />
        <TextField
          id="waterTempC"
          name="waterTempC"
          label="Teplota vody (°C, nepovinné)"
          defaultValue={initialValues?.waterTempC}
        />
      </div>

      <PhaseEditor phases={phases} onChange={setPhases} showPressure={showPressure} />

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <SubmitButton label={submitLabel} />
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  defaultValue,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: number | null;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-300">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        defaultValue={defaultValue != null ? String(defaultValue) : ""}
        className={inputClass}
      />
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
    >
      {pending ? "Ukládám…" : label}
    </button>
  );
}
