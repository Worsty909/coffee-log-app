"use client";

// Číselné pole, které se dá normálně editovat.
//
// Běžné `<input type="number">` navázané na číslo v Reactu se chová
// nepříjemně: po smazání obsahu v něm zůstane 0 a další psaní pak dá
// číslo s vedoucí nulou ("015"). Tahle komponenta proto drží **text**
// (prázdný řetězec je platný stav) a na číslo se překládá až tam, kde
// se počítá — viz src/lib/brew-math.ts.
//
// `inputMode="decimal"` vytáhne na mobilu numerickou klávesnici, ale
// necháváme `type="text"`, aby prohlížeč nepřepisoval to, co uživatel
// píše, a aby šla psát i desetinná čárka.

type NumberFieldProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange?: (text: string) => void;
  /** Pole se dopočítává — je jen pro čtení a vizuálně odlišené. */
  readOnly?: boolean;
  suffix?: string;
  placeholder?: string;
  hint?: string;
};

export function NumberField({
  id,
  name,
  label,
  value,
  onChange,
  readOnly,
  suffix,
  placeholder,
  hint,
}: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-300">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm tabular-nums outline-none transition ${
            readOnly
              ? "border-stone-700 bg-stone-800/60 text-amber-300"
              : "border-stone-700 bg-stone-900 text-stone-100 focus:border-amber-600"
          } ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-stone-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
