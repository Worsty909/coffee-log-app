import { getSettings } from "@/lib/settings";
import { logout } from "@/lib/actions/auth";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="page-title">Nastavení</h1>
        <p className="mt-1 text-sm text-stone-500">
          Vybavení se ukládá ke každému receptu, aby historie dávala smysl i po jeho výměně.
        </p>
      </header>

      <SettingsForm settings={settings} />

      <section className="space-y-3 card p-4">
        <div>
          <h2 className="section-title">Zabezpečení</h2>
          <p className="mt-1 text-xs text-stone-500">
            Deník je chráněný PINem. Přihlášení na tomhle zařízení vydrží 90 dní; PIN se mění
            proměnnou prostředí <code className="font-mono">APP_PIN</code> na serveru a jeho změna
            odhlásí všechna zařízení.
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="btn btn-secondary"
          >
            Odhlásit toto zařízení
          </button>
        </form>
      </section>
    </div>
  );
}
