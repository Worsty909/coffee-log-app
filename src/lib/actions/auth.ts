"use server";

import { redirect } from "next/navigation";
import { attemptLogin, endSession, startSession } from "@/lib/auth/server";
import { describeWait } from "@/lib/auth/lockout";
import { safeNextPath } from "@/lib/auth/session";

export type LoginFormState = {
  error: string | null;
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const pin = formData.get("pin");
  if (typeof pin !== "string" || !/^\d{1,12}$/.test(pin)) {
    // Nesmysl (prázdno, písmena) se nepočítá jako pokus — PIN to být nemůže.
    return { error: "Zadej číselný PIN." };
  }

  let result;
  try {
    result = await attemptLogin(pin);
  } catch (error) {
    console.error(error);
    return { error: "Přihlášení se nepovedlo ověřit. Zkus to prosím znovu." };
  }

  switch (result.status) {
    case "not-configured":
      return { error: "Appka nemá nastavený PIN (proměnná prostředí APP_PIN)." };
    case "locked":
      return { error: lockedMessage(result.lockedUntil) };
    case "invalid":
      if (result.lockedUntil) return { error: `Nesprávný PIN. ${lockedMessage(result.lockedUntil)}` };
      return {
        error: `Nesprávný PIN. ${
          result.attemptsLeft === 1
            ? "Zbývá poslední pokus"
            : `Zbývají ${result.attemptsLeft} pokusy`
        }, pak se přihlášení na čas zamkne.`,
      };
  }

  await startSession();
  redirect(safeNextPath(formData.get("next")));
}

function lockedMessage(lockedUntil: Date): string {
  return `Příliš mnoho chybných pokusů — další zkus ${describeWait(lockedUntil.getTime() - Date.now())}.`;
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/login");
}
