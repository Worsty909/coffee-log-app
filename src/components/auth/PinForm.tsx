"use client";

import { useActionState, useState } from "react";
import { login, type LoginFormState } from "@/lib/actions/auth";

const MAX_LENGTH = 12;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Zadání PINu: číselná klávesnice na obrazovce (pohodlná na mobilu
 * v PWA režimu) a zároveň obyčejné pole, do kterého jde psát z klávesnice
 * nebo ho nechat vyplnit správcem hesel.
 *
 * Formulář záměrně neodesílá sám po N číslicích — prohlížeč by se tím
 * dozvěděl délku PINu. Ta zůstává jen na serveru.
 */
export function PinForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(login, {
    error: null,
  });
  const [pin, setPin] = useState("");

  const press = (digit: string) =>
    setPin((current) => (current.length < MAX_LENGTH ? current + digit : current));

  return (
    <form
      action={(formData) => {
        setPin("");
        formAction(formData);
      }}
      className="mt-6 w-full"
    >
      <input type="hidden" name="next" value={next} />

      <label htmlFor="pin" className="sr-only">
        PIN
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="current-password"
        autoFocus
        required
        maxLength={MAX_LENGTH}
        value={pin}
        onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, MAX_LENGTH))}
        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] text-stone-100 outline-none focus:border-amber-600"
      />

      <p role="alert" aria-live="polite" className="mt-3 min-h-10 text-sm text-red-400">
        {state.error}
      </p>

      <div className="mt-1 grid grid-cols-3 gap-2">
        {KEYS.map((digit) => (
          <PadKey key={digit} onClick={() => press(digit)}>
            {digit}
          </PadKey>
        ))}
        <PadKey onClick={() => setPin((current) => current.slice(0, -1))} label="Smazat číslici" muted>
          ⌫
        </PadKey>
        <PadKey onClick={() => press("0")}>0</PadKey>
        <button
          type="submit"
          disabled={pending || pin.length === 0}
          className="rounded-xl bg-amber-700 py-4 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-40"
        >
          {pending ? "…" : "Odemknout"}
        </button>
      </div>
    </form>
  );
}

function PadKey({
  children,
  onClick,
  label,
  muted,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label?: string;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`rounded-xl border border-stone-800 bg-stone-900/60 py-4 text-xl tabular-nums transition hover:border-stone-700 active:bg-stone-800 ${
        muted ? "text-stone-400" : "text-stone-100"
      }`}
    >
      {children}
    </button>
  );
}
