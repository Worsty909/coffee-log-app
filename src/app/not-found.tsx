import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-dashed border-stone-800 p-8 text-center">
      <h1 className="text-lg font-semibold text-stone-100">Tohle tu není</h1>
      <p className="mt-1 text-sm text-stone-500">
        Stránka neexistuje, nebo byl záznam mezitím smazán.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm text-amber-500 hover:underline">
        Zpět na přehled
      </Link>
    </div>
  );
}
