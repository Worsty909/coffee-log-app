"use client";

// Trojice dávka / výdej / poměr s dopočtem té hodnoty, kterou si
// uživatel označí. Sdílí ji espresso i filtr — liší se jen popisky.
import type { BrewField, BrewValues } from "@/lib/brew-math";
import { NumberField } from "@/components/ui/NumberField";

type RatioCalculatorProps = {
  values: BrewValues;
  derived: BrewField;
  onEdit: (field: BrewField, text: string) => void;
  onDerivedChange: (field: BrewField) => void;
  /** Popisky se liší podle metody: espresso má "dávku a výdej", filtr "kávu a vodu". */
  labels: Record<BrewField, string>;
};

const FIELD_ORDER: BrewField[] = ["dose", "yield", "ratio"];

export function RatioCalculator({
  values,
  derived,
  onEdit,
  onDerivedChange,
  labels,
}: RatioCalculatorProps) {
  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-stone-200">Poměr</h2>
        <p className="text-xs text-stone-500">
          Vyplň dvě hodnoty, třetí appka dopočítá.
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {FIELD_ORDER.map((field) => (
          <div key={field}>
            <NumberField
              id={`brew-${field}`}
              name={field}
              label={labels[field]}
              value={values[field]}
              readOnly={derived === field}
              onChange={(text) => onEdit(field, text)}
              suffix={field === "ratio" ? undefined : "g"}
              placeholder={field === "ratio" ? "např. 2,5" : undefined}
            />
            <button
              type="button"
              onClick={() => onDerivedChange(field)}
              disabled={derived === field}
              className={`mt-1.5 w-full rounded-md px-2 py-1 text-xs transition ${
                derived === field
                  ? "bg-amber-900/40 font-medium text-amber-300"
                  : "text-stone-500 hover:bg-stone-800 hover:text-stone-300"
              }`}
            >
              {derived === field ? "dopočítává se" : "dopočítat"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
