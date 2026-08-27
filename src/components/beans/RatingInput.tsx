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
      <legend className="text-sm font-medium text-stone-300">{label}</legend>
      <div className="mt-1.5 flex items-center gap-2" role="radiogroup" aria-label={label}>
        {SCALE.map((value) => (
          <label
            key={value}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-stone-700 text-sm text-stone-300 transition hover:border-stone-600 has-checked:border-amber-600 has-checked:bg-amber-700 has-checked:text-white"
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
