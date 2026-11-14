// Zobrazí se hned po kliknutí na odkaz, než server dotáhne data z
// databáze — appka díky tomu reaguje okamžitě i na pomalejším připojení.
export default function Loading() {
  return (
    <div className="space-y-3" role="status" aria-label="Načítám">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-stone-800" />
      <div className="h-20 animate-pulse rounded-xl bg-stone-800/50" />
      <div className="h-20 animate-pulse rounded-xl bg-stone-800/50" />
      <div className="h-20 animate-pulse rounded-xl bg-stone-800/50" />
    </div>
  );
}
