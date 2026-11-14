"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { formatSeconds } from "@/lib/format";
import {
  getSoundSetting,
  playCue,
  primeCues,
  setSoundSetting,
  subscribeSoundSetting,
} from "@/lib/cue";
import { SoundOffIcon, SoundOnIcon } from "@/components/ui/icons";

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

// Rozměry kruhového ukazatele.
const RING_SIZE = 224;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

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

  const soundEnabled = useSyncExternalStore(subscribeSoundSetting, getSoundSetting, () => true);

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
  const reachedPlan = plannedTotal > 0 && elapsed >= plannedTotal;
  const overtime = elapsed > plannedTotal;

  // Signál při přechodu do další fáze a při dosažení plánu — při páčení
  // se člověk dívá na manometr, ne na telefon. Zvuk + vibrace (viz
  // lib/cue.ts) a k tomu probliknutí karty.
  useEffect(() => {
    if (running && currentIndex > 0) playCue("phase");
  }, [running, currentIndex]);

  useEffect(() => {
    if (running && reachedPlan) playCue("done");
  }, [running, reachedPlan]);

  function handleStart() {
    primeCues(); // zvuk se smí odemknout jen přímo z ťuknutí
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
  const pressure = current ? formatPhasePressure(current) : null;

  const progress = plannedTotal > 0 ? Math.min(1, elapsed / plannedTotal) : 0;
  const center = RING_SIZE / 2;

  return (
    <section className="card relative p-4">
      {/* Probliknutí při změně fáze — nový `key` animaci spustí znovu. */}
      {running && (currentIndex > 0 || reachedPlan) && (
        <div
          key={`${currentIndex}-${reachedPlan}`}
          aria-hidden="true"
          className="phase-flash pointer-events-none absolute inset-0 rounded-2xl border border-transparent"
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <h2 className="section-title">Časovač</h2>
        <div className="flex items-center gap-3">
          <p className="text-xs tabular-nums text-stone-500">plán {formatSeconds(plannedTotal)}</p>
          <button
            type="button"
            onClick={() => {
              setSoundSetting(!soundEnabled);
              if (!soundEnabled) primeCues();
            }}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Vypnout zvuk při změně fáze" : "Zapnout zvuk při změně fáze"}
            title="Pípnutí při změně fáze"
            className={`-m-1.5 rounded-lg p-1.5 transition ${
              soundEnabled ? "text-amber-400" : "text-stone-600"
            }`}
          >
            {soundEnabled ? <SoundOnIcon className="h-5 w-5" /> : <SoundOffIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Kruh: celý obvod = plánovaný čas, dílky = fáze. */}
      <div className="relative mx-auto mt-2" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden="true">
          <circle
            cx={center}
            cy={center}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            className="stroke-white/[0.07]"
          />
          <circle
            cx={center}
            cy={center}
            r={RING_RADIUS}
            fill="none"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - progress)}
            className={`${overtime ? "stroke-amber-300" : "stroke-amber-500"} ${
              running ? "transition-[stroke-dashoffset] duration-1000 ease-linear" : ""
            }`}
            style={{ opacity: elapsed === 0 ? 0 : 1 }}
          />
          {/* Zářezy na hranicích fází. */}
          {phases.length > 1 &&
            boundaries.slice(0, -1).map((end, index) => {
              const angle = (end / plannedTotal) * 2 * Math.PI;
              const inner = RING_RADIUS - RING_STROKE / 2 - 1;
              const outer = RING_RADIUS + RING_STROKE / 2 + 1;
              return (
                <line
                  key={index}
                  x1={center + inner * Math.cos(angle)}
                  y1={center + inner * Math.sin(angle)}
                  x2={center + outer * Math.cos(angle)}
                  y2={center + outer * Math.sin(angle)}
                  strokeWidth="3"
                  className="stroke-surface"
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p
            role="timer"
            className={`text-5xl font-semibold tracking-tight tabular-nums ${
              overtime ? "text-amber-300" : "text-stone-50"
            }`}
          >
            {formatSeconds(elapsed)}
          </p>
          {running && current ? (
            <>
              <p className="mt-1 text-sm font-medium text-amber-300">{current.label}</p>
              <p className="text-xs tabular-nums text-stone-400">
                {pressure && `${pressure} · `}
                {phaseElapsed}/{current.durationSeconds} s
              </p>
            </>
          ) : (
            <p className="mt-1 max-w-36 text-xs text-stone-500">
              {elapsed === 0 ? "Připraveno ke spuštění" : "Zastaveno — čas je v receptu"}
            </p>
          )}
        </div>
      </div>

      {running && current?.note && (
        <p className="mt-3 rounded-xl bg-white/[0.05] px-3 py-2 text-center text-sm text-stone-300">
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
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-amber-500/15 font-medium text-amber-200"
                  : done
                    ? "text-stone-600"
                    : "text-stone-400"
              }`}
            >
              <span>{phase.label}</span>
              <span className="tabular-nums">{describePhase(phase)}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex gap-2">
        {!running ? (
          <button type="button" onClick={handleStart} className="btn btn-primary flex-1 py-3 text-base">
            {elapsed === 0 ? "Start" : "Spustit znovu"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="btn flex-1 bg-red-700 py-3 text-base text-white hover:bg-red-600"
          >
            Stop
          </button>
        )}
        {!running && elapsed > 0 && (
          <button type="button" onClick={handleReset} className="btn btn-secondary py-3">
            Vynulovat
          </button>
        )}
      </div>
    </section>
  );
}
