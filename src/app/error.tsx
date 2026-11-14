"use client"; // hranice chyb musí být klientská komponenta

import { useEffect } from "react";

// Zachytí chybu při načítání stránky (typicky výpadek databáze) a místo
// bílé obrazovky nabídne zkusit to znovu.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-6 text-center">
      <h1 className="text-lg font-semibold text-stone-100">Něco se pokazilo</h1>
      <p className="mt-1 text-sm text-stone-400">
        Stránku se nepovedlo načíst — nejspíš chvilkový výpadek spojení s databází.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-4 btn btn-primary"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
