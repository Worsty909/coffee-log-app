// Zobrazení hodnocení 1–5 jako vyplněných teček — čitelnější na první
// pohled než holé číslo.
export function RatingDisplay({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`h-2.5 w-2.5 rounded-full ${
              value && dot <= value ? "bg-amber-700" : "bg-neutral-200"
            }`}
          />
        ))}
        {!value && <span className="ml-1 text-xs text-neutral-400">neurčeno</span>}
      </div>
    </div>
  );
}
