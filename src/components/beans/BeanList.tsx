"use client";

import { useState } from "react";
import Link from "next/link";

export type BeanListItem = {
  id: string;
  coffeeName: string;
  roaster: string;
  origin: string;
  process: string;
  roastLevel: string | null;
  recipeCount: number;
  /** Nejlepší hodnocení šálku z tohohle zrnka, pokud už nějaké je. */
  bestRating: number | null;
  /** "praženo před 12 dny" */
  roastAge: string | null;
};

/** Bez diakritiky a malými písmeny — "etiopie" najde "Etiopie", "prazirna" "Pražírna". */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Hledání má smysl, až když se seznam nevejde na jednu obrazovku.
const SEARCH_FROM = 6;

export function BeanList({ beans }: { beans: BeanListItem[] }) {
  const [query, setQuery] = useState("");

  const words = normalize(query).split(/\s+/).filter(Boolean);
  const visible =
    words.length === 0
      ? beans
      : beans.filter((bean) => {
          const haystack = normalize(
            [bean.coffeeName, bean.roaster, bean.origin, bean.process, bean.roastLevel ?? ""].join(" "),
          );
          return words.every((word) => haystack.includes(word));
        });

  return (
    <div className="space-y-3">
      {beans.length >= SEARCH_FROM && (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Hledat podle názvu, pražírny, původu…"
          aria-label="Hledat v zrnkách"
          className="w-full rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-600"
        />
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-800 p-6 text-center text-sm text-stone-500">
          Nic neodpovídá hledání „{query}“.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((bean) => (
            <li key={bean.id}>
              <Link
                href={`/beans/${bean.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3 transition hover:border-stone-700"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-100">{bean.coffeeName}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {bean.roaster} · {bean.origin} · {bean.process}
                    {bean.roastLevel ? ` · ${bean.roastLevel}` : ""}
                  </p>
                  {bean.roastAge && <p className="mt-0.5 text-xs text-stone-600">{bean.roastAge}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {bean.bestRating !== null && (
                    <span
                      className="rounded-full bg-amber-900/40 px-2 py-0.5 text-xs text-amber-300"
                      title="Nejlepší hodnocení šálku"
                    >
                      {bean.bestRating}/5
                    </span>
                  )}
                  <span className="text-xs tabular-nums text-stone-500">{bean.recipeCount}×</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
