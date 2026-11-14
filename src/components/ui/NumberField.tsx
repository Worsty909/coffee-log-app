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
import { normalizeDurationInput } from "@/lib/format";

type NumberFieldProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange?: (text: string) => void;
  /** Pole se dopočítává — je jen pro čtení a vizuálně odlišené. */
  readOnly?: boolean;
  /**
   * Pole je čas ("32" nebo "2:45"). Číselná klávesnice dvojtečku nemá,
   * takže se čárka/tečka při psaní rovnou přepisuje na dvojtečku.
   */
  duration?: boolean;
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
  duration,
  suffix,
  placeholder,
  hint,
}: NumberFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
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
          onChange={(event) =>
            onChange?.(duration ? normalizeDurationInput(event.target.value) : event.target.value)
          }
          className={`input tabular-nums ${suffix ? "pr-10" : ""}`}
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
