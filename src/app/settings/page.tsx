import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-stone-100">Nastavení</h1>
        <p className="mt-1 text-sm text-stone-500">
          Vybavení se ukládá ke každému receptu, aby historie dávala smysl i po jeho výměně.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}
