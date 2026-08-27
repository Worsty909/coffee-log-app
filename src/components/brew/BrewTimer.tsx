"use client";

import { useEffect, useRef, useState } from "react";

function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type BrewTimerProps = {
  bloomSeconds: number;
  onStop: (elapsedSeconds: number) => void;
};

// Časovač extrakce: stopky, které po uplynutí `bloomSeconds` samy
// přepnou popisek fáze z "Bloom" na "Extrakce". Skutečnou uplynulou dobu
// při zastavení appka pošle rodiči přes `onStop`, ten si s ní naplní
// políčka "skutečná doba" v receptu.
export function BrewTimer({ bloomSeconds, onStop }: BrewTimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed((value) => value + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const phase = !running && elapsed === 0 ? "idle" : elapsed < bloomSeconds ? "bloom" : "brewing";

  function handleStart() {
    setElapsed(0);
    setRunning(true);
  }

  function handleStop() {
    setRunning(false);
    onStop(elapsed);
  }

  function handleReset() {
    setRunning(false);
    setElapsed(0);
  }

  return (
    <div className="rounded-md border border-neutral-200 bg-white p-4">
      <p className="text-3xl font-mono tabular-nums text-neutral-900">{formatSeconds(elapsed)}</p>
      <p className="mt-1 text-sm text-neutral-500">
        {phase === "idle" && "Připraveno ke spuštění"}
        {phase === "bloom" && `Bloom fáze (cíl ${bloomSeconds} s)`}
        {phase === "brewing" && "Extrakce"}
      </p>
      <div className="mt-3 flex gap-2">
        {!running ? (
          <button
            type="button"
            onClick={handleStart}
            className="rounded-md bg-amber-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-900"
          >
            {elapsed === 0 ? "Start" : "Spustit znovu"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
          >
            Stop
          </button>
        )}
        {!running && elapsed > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Vynulovat
          </button>
        )}
      </div>
    </div>
  );
}
