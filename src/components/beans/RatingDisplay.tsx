// Zobrazení hodnocení 1–5 jako vyplněných teček — čitelnější na první
// pohled než holé číslo.
export function RatingDisplay({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <div className="mt-1.5 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`h-2.5 w-5 rounded-full ${
              value && dot <= value ? "bg-amber-500" : "bg-white/10"
            }`}
          />
        ))}
        {!value && <span className="ml-1 text-xs text-stone-600">neurčeno</span>}
      </div>
    </div>
  );
}
