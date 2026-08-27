"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Process } from "@/generated/prisma/enums";
import { processLabels } from "@/lib/validation/bean";
import type { BeanFormState } from "@/lib/actions/beans";
import { RatingInput } from "./RatingInput";

// Tvar dat, která formulář předvyplní. Odpovídá modelu Bean, ale je
// samostatný typ, protože formulář o typu z Prisma nemusí vědět.
export type BeanFormValues = {
  roaster: string;
  coffeeName: string;
  originCountry: string;
  region: string | null;
  process: Process;
  roastDate: Date | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  aftertaste: number | null;
  notes: string | null;
  photoUrl: string | null;
};

type BeanFormProps = {
  action: (prevState: BeanFormState, formData: FormData) => Promise<BeanFormState>;
  initialValues?: BeanFormValues;
  submitLabel: string;
};

const emptyValues: BeanFormValues = {
  roaster: "",
  coffeeName: "",
  originCountry: "",
  region: null,
  process: Process.WASHED,
  roastDate: null,
  sweetness: null,
  acidity: null,
  body: null,
  aftertaste: null,
  notes: null,
  photoUrl: null,
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function BeanForm({ action, initialValues, submitLabel }: BeanFormProps) {
  const values = initialValues ?? emptyValues;
  const [state, formAction] = useActionState<BeanFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pražírna" name="roaster" required defaultValue={values.roaster} />
        <Field label="Název kávy" name="coffeeName" required defaultValue={values.coffeeName} />
        <Field label="Země původu" name="originCountry" required defaultValue={values.originCountry} />
        <Field label="Region (nepovinné)" name="region" defaultValue={values.region ?? ""} />

        <div>
          <label htmlFor="process" className="block text-sm font-medium text-neutral-700">
            Zpracování
          </label>
          <select
            id="process"
            name="process"
            defaultValue={values.process}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {Object.values(Process).map((process) => (
              <option key={process} value={process}>
                {processLabels[process]}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Datum pražení (nepovinné)"
          name="roastDate"
          type="date"
          defaultValue={toDateInputValue(values.roastDate)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <RatingInput name="sweetness" label="Sladkost" defaultValue={values.sweetness} />
        <RatingInput name="acidity" label="Kyselost" defaultValue={values.acidity} />
        <RatingInput name="body" label="Tělo" defaultValue={values.body} />
        <RatingInput name="aftertaste" label="Dochuť" defaultValue={values.aftertaste} />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Poznámky
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={values.notes ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-neutral-700">
          Fotka štítku (nepovinné)
        </label>
        {values.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- lokální upload, ne optimalizovaný Next Image zdroj
          <img
            src={values.photoUrl}
            alt="Aktuální fotka štítku"
            className="mt-2 h-32 w-32 rounded-md object-cover"
          />
        )}
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 block text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

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
      className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-50"
    >
      {pending ? "Ukládám…" : label}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
