import type { Metadata } from "next";
import { getAuthConfig } from "@/lib/auth/config";
import { safeNextPath } from "@/lib/auth/session";
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
    <div className="mx-auto flex max-w-xs flex-col items-center pt-10 text-center">
      <h1 className="text-2xl font-semibold text-stone-100">Coffee Log</h1>

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
