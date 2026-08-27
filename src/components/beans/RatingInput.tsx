"use client";

// Vstup pro hodnocení chuti na škále 1–5 formou tlačítek (místo textového
// pole nebo posuvníku) — na dotek/kliknutí je to rychlejší a jasně vidět,
// co je vybrané.
type RatingInputProps = {
  name: string;
  label: string;
  defaultValue?: number | null;
};

const SCALE = [1, 2, 3, 4, 5];

export function RatingInput({ name, label, defaultValue }: RatingInputProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-neutral-700">{label}</legend>
      <div className="mt-1 flex gap-2" role="radiogroup" aria-label={label}>
        {SCALE.map((value) => (
          <label
            key={value}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-sm has-checked:border-amber-700 has-checked:bg-amber-700 has-checked:text-white"
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
        <label className="flex h-9 items-center px-2 text-xs text-neutral-500 has-checked:font-medium has-checked:text-amber-700">
          <input type="radio" name={name} value="" defaultChecked={!defaultValue} className="sr-only" />
          neurčeno
        </label>
      </div>
    </fieldset>
  );
}
