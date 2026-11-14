"use server";

// Server akce pro správu receptů (PressureProfile + jejich fází).
// Vestavěné i vlastní recepty se spravují stejně — appka je čistě
// osobní nástroj, takže není důvod vestavěné recepty chránit před
// úpravou nebo smazáním.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/server";
import { describeActionError } from "./errors";
import { profileInputSchema } from "@/lib/validation/profile";

export type ProfileFormState = {
  error: string | null;
};

export async function createProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireAuth();
  try {
    const { phases, ...profile } = profileInputSchema.parse(Object.fromEntries(formData));

    const lastSortOrder = await prisma.pressureProfile.aggregate({
      where: { methodId: profile.methodId },
      _max: { sortOrder: true },
    });

    await prisma.pressureProfile.create({
      data: {
        ...profile,
        isCustom: true,
        sortOrder: (lastSortOrder._max.sortOrder ?? -1) + 1,
        phases: { create: phases.map((phase, order) => ({ ...phase, order })) },
      },
    });
  } catch (error) {
    return { error: describeActionError(error, { duplicate: "Recept s tímhle názvem už existuje." }) };
  }

  revalidatePath("/profiles");
  revalidatePath("/brew/new");
  redirect("/profiles");
}

export async function updateProfile(
  profileId: string,
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  await requireAuth();
  try {
    const { phases, ...profile } = profileInputSchema.parse(Object.fromEntries(formData));

    // Fáze se při úpravě přepíší celé, ať se nemusí složitě dopočítávat
    // rozdíl mezi starým a novým pořadím/počtem řádků.
    await prisma.$transaction([
      prisma.pressureProfile.update({ where: { id: profileId }, data: profile }),
      prisma.pressurePhase.deleteMany({ where: { profileId } }),
      prisma.pressurePhase.createMany({
        data: phases.map((phase, order) => ({ ...phase, profileId, order })),
      }),
    ]);
  } catch (error) {
    return { error: describeActionError(error, { duplicate: "Recept s tímhle názvem už existuje." }) };
  }

  revalidatePath("/profiles");
  revalidatePath("/brew/new");
  redirect("/profiles");
}

export async function deleteProfile(profileId: string): Promise<void> {
  await requireAuth();
  // Recepty, které tenhle recept použily, o něj nepřijdou — jen jim
  // zmizí odkaz na konkrétní recept (viz onDelete: SetNull ve schématu),
  // v historii se pak ukáže aspoň název metody.
  await prisma.pressureProfile.delete({ where: { id: profileId } });
  revalidatePath("/profiles");
  revalidatePath("/brew/new");
  redirect("/profiles");
}
