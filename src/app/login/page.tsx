import type { Metadata } from "next";
import { getAuthConfig } from "@/lib/auth/config";
import { safeNextPath } from "@/lib/auth/session";
import { CupIcon } from "@/components/ui/icons";
import { PinForm } from "@/components/auth/PinForm";

export const metadata: Metadata = { title: "Přihlášení — Coffee Log" };

// Stránka se rozhoduje podle proměnných prostředí za běhu, ne při buildu.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = getAuthConfig() !== null;

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center pt-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-b from-amber-500 to-amber-700 text-white shadow-xl shadow-amber-900/40">
        <CupIcon className="h-9 w-9" />
      </span>
      <h1 className="page-title mt-4">Coffee Log</h1>

      {configured ? (
        <>
          <p className="mt-1 text-sm text-stone-400">Zadej PIN pro odemčení deníku.</p>
          <PinForm next={safeNextPath(next)} />
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-left text-sm text-amber-200">
          Appka je zamčená, protože nemá nastavený PIN. Doplň na serveru proměnnou prostředí{" "}
          <code className="font-mono">APP_PIN</code> (4–12 číslic) a appku restartuj / znovu
          nasaď — postup je v README.
        </p>
      )}
    </div>
  );
}
