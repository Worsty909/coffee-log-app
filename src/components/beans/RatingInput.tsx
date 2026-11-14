"use client";

// Vstup pro hodnocení na škále 1–5 formou tlačítek (místo textového
// pole nebo posuvníku) — na dotek/kliknutí je to rychlejší a jasně
// vidět, co je vybrané.
type RatingInputProps = {
  name: string;
  label: string;
  defaultValue?: number | null;
};

const SCALE = [1, 2, 3, 4, 5];

export function RatingInput({ name, label, defaultValue }: RatingInputProps) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="mt-1.5 flex items-center gap-2" role="radiogroup" aria-label={label}>
        {SCALE.map((value) => (
          <label
            key={value}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-white/[0.03] text-sm tabular-nums text-stone-300 transition hover:border-stone-500 active:scale-95 has-checked:border-amber-500 has-checked:bg-linear-to-b has-checked:from-amber-500 has-checked:to-amber-700 has-checked:font-semibold has-checked:text-white has-checked:shadow-lg has-checked:shadow-amber-900/40"
          >
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              className="sr-only"
            />
            {value}
          </label>
        ))}
        <label className="flex h-9 cursor-pointer items-center px-2 text-xs text-stone-600 transition has-checked:font-medium has-checked:text-amber-400">
          <input
            type="radio"
            name={name}
            value=""
            defaultChecked={!defaultValue}
            className="sr-only"
          />
          neurčeno
        </label>
      </div>
    </fieldset>
  );
}
