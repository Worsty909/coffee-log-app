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
          className="input"
        />
      )}

      {visible.length === 0 ? (
        <p className="empty">
          Nic neodpovídá hledání „{query}“.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((bean) => (
            <li key={bean.id}>
              <Link
                href={`/beans/${bean.id}`}
                className="card flex items-center gap-3 p-3"
              >
                {/* Monogram pražírny — rychlá vizuální kotva v seznamu. */}
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/25 to-amber-900/20 font-display text-lg font-semibold text-amber-300"
                >
                  {bean.roaster.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-100">{bean.coffeeName}</p>
                  <p className="mt-0.5 truncate text-xs text-stone-500">
                    {bean.roaster} · {bean.origin} · {bean.process}
                    {bean.roastLevel ? ` · ${bean.roastLevel}` : ""}
                  </p>
                  {bean.roastAge && <p className="mt-0.5 text-xs text-stone-600">{bean.roastAge}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {bean.bestRating !== null && (
                    <span className="chip" title="Nejlepší hodnocení šálku">
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
