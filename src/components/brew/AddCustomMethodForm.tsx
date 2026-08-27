"use client";

import { useActionState, useState } from "react";
import { createCustomMethod } from "@/lib/actions/methods";

// Samostatný formulář pro přidání vlastní metody přípravy. Je záměrně
// mimo hlavní formulář receptu (HTML nepovoluje formulář ve formuláři) —
// po uložení appka jen obnoví seznam metod, novou metodu si pak vybereš
// v selectu hlavního formuláře.
export function AddCustomMethodForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createCustomMethod, { error: null });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-amber-800 hover:underline"
      >
        + Přidat vlastní metodu
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3"
    >
      <div>
        <label htmlFor="newMethodName" className="block text-xs font-medium text-neutral-700">
          Název metody
        </label>
        <input
          id="newMethodName"
          name="name"
          required
          className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label htmlFor="newMethodRatio" className="block text-xs font-medium text-neutral-700">
          Výchozí poměr (1:N)
        </label>
        {/* Bez `step` (resp. se `step="any"`) jde zadat libovolné
            desetinné číslo — např. 2,777 pro 18 g → 50 g. Dřív tu byl
            krok 0,5, který jemnější poměry odmítal. */}
        <input
          id="newMethodRatio"
          name="defaultRatio"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="např. 2,777"
          required
          className="mt-1 w-28 rounded-md border border-neutral-300 px-2 py-1 text-sm"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-amber-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-900"
      >
        Přidat
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:underline">
        Zrušit
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
