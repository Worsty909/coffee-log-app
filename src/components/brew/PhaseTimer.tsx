"use client";

import { useEffect, useRef, useState } from "react";
import { formatSeconds } from "@/lib/format";

export type TimerPhase = {
  label: string;
  targetBarMin: number | null;
  targetBarMax: number | null;
  durationSeconds: number;
  note: string | null;
};

type PhaseTimerProps = {
  phases: TimerPhase[];
  /** Volá se při zastavení se skutečnou celkovou dobou v sekundách. */
  onStop: (elapsedSeconds: number) => void;
};

/**
 * Cílový tlak fáze jako text: "6–9 bar", "3 bar", "bez tlaku".
 * Vrací null pro fáze bez tlaku vůbec (filtr) — tam se sloupec s tlakem
 * jen vynechá, místo aby se ukazovala prázdná pomlčka.
 */
export function formatPhasePressure(phase: TimerPhase): string | null {
  const { targetBarMin: min, targetBarMax: max } = phase;
  if (min === null && max === null) return null;
  if (min === 0 && max === 0) return "bez tlaku";
  if (min !== null && max !== null && min !== max) return `${min}–${max} bar`;
  return `${max ?? min} bar`;
}

/** Popis fáze pro seznam: tlak a délka, nebo jen délka u filtru. */
export function describePhase(phase: TimerPhase): string {
  const pressure = formatPhasePressure(phase);
  return pressure ? `${pressure} · ${phase.durationSeconds} s` : `${phase.durationSeconds} s`;
}

/**
 * Časovač, který tě provede fázemi tlakového profilu.
 *
 * Fáze mají jen *plánovanou* délku — na páce se všechno posouvá, takže
 * časovač fáze nepřepíná násilím podle plánu, ale ukazuje, ve které bys
 * podle plánu měl být, a nechá tě běžet dál. Uložená hodnota je vždy
 * skutečně naměřený čas.
 */
export function PhaseTimer({ phases, onStop }: PhaseTimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Čas se počítá z hodin (rozdíl proti okamžiku startu), ne přičítáním
  // jedničky každou sekundu — prohlížeč na pozadí nebo při zhasnutém
  // displeji intervaly brzdí a časovač by se tiše zpožďoval.
  const startedAtRef = useRef<number | null>(null);

  const readElapsed = () =>
    startedAtRef.current === null ? 0 : Math.floor((Date.now() - startedAtRef.current) / 1000);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(readElapsed()), 200);
    return () => clearInterval(interval);
  }, [running]);

  // Během měření nenecháme zhasnout displej (Screen Wake Lock API).
  // Kde ho prohlížeč nepodporuje, se prostě nic nestane.
  useEffect(() => {
    if (!running || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const next = await navigator.wakeLock.request("screen");
        if (cancelled) void next.release();
        else lock = next;
      } catch {
        // Zamítnuto (úsporný režim, stránka na pozadí) — nevadí.
      }
    };
    // Zámek se uvolní při přepnutí pryč; po návratu si ho vezmeme znovu.
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release();
    };
  }, [running]);

  // Kumulativní hranice fází, ať víme, ve které fázi jsme.
  const boundaries: number[] = [];
  phases.reduce((sum, phase) => {
    const end = sum + phase.durationSeconds;
    boundaries.push(end);
    return end;
  }, 0);

  const plannedTotal = boundaries.at(-1) ?? 0;
  const activeIndex = boundaries.findIndex((end) => elapsed < end);
  // Když přeteče plán, zůstáváme vizuálně v poslední fázi.
  const currentIndex = activeIndex === -1 ? phases.length - 1 : activeIndex;
  const overtime = elapsed > plannedTotal;

  // Krátké zavibrování při přechodu do další fáze — při páčení se
  // člověk dívá na manometr, ne na telefon.
  useEffect(() => {
    if (running && currentIndex > 0 && "vibrate" in navigator) {
      navigator.vibrate(150);
    }
  }, [running, currentIndex]);

  function handleStart() {
    startedAtRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
  }

  function handleStop() {
    const final = readElapsed();
    setElapsed(final);
    setRunning(false);
    onStop(final);
  }

  function handleReset() {
    startedAtRef.current = null;
    setRunning(false);
    setElapsed(0);
  }

  const current = phases[currentIndex];
  const phaseStart = currentIndex === 0 ? 0 : boundaries[currentIndex - 1];
  const phaseElapsed = Math.max(0, elapsed - phaseStart);

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-stone-200">Časovač</h2>
        <p className="text-xs text-stone-500">plán {formatSeconds(plannedTotal)}</p>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <p
          className={`font-mono text-4xl tabular-nums ${
            overtime ? "text-amber-400" : "text-stone-100"
          }`}
        >
          {formatSeconds(elapsed)}
        </p>
        {running && current && (
          <div className="text-sm">
            <p className="font-medium text-amber-300">{current.label}</p>
            <p className="text-stone-400">
              {formatPhasePressure(current) && `${formatPhasePressure(current)} · `}
              {phaseElapsed}/{current.durationSeconds} s
            </p>
          </div>
        )}
        {!running && elapsed === 0 && (
          <p className="text-sm text-stone-500">Připraveno ke spuštění</p>
        )}
        {!running && elapsed > 0 && (
          <p className="text-sm text-stone-500">Zastaveno — čas se propsal do receptu</p>
        )}
      </div>

      {running && current?.note && (
        <p className="mt-2 rounded-lg bg-stone-800/70 px-3 py-2 text-sm text-stone-300">
          {current.note}
        </p>
      )}

      {/* Přehled fází — aktivní zvýrazněná, hotové ztlumené. */}
      <ol className="mt-3 space-y-1">
        {phases.map((phase, index) => {
          const done = running || elapsed > 0 ? elapsed >= boundaries[index] : false;
          const active = running && index === currentIndex;
          return (
            <li
              key={`${phase.label}-${index}`}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                active
                  ? "bg-amber-900/30 text-amber-200"
                  : done
                    ? "text-stone-600"
                    : "text-stone-400"
              }`}
            >
              <span>{phase.label}</span>
              <span className="tabular-nums">
                {describePhase(phase)}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex gap-2">
        {!running ? (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            {elapsed === 0 ? "Start" : "Spustit znovu"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Stop
          </button>
        )}
        {!running && elapsed > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800"
          >
            Vynulovat
          </button>
        )}
      </div>
    </section>
  );
}
