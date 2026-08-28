import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profiles/ProfileForm";
import { updateProfile } from "@/lib/actions/profiles";

export const dynamic = "force-dynamic";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [profile, methods] = await Promise.all([
    prisma.pressureProfile.findUnique({
      where: { id },
      include: { phases: { orderBy: { order: "asc" } } },
    }),
    prisma.brewMethod.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-stone-100">Upravit recept — {profile.name}</h1>
      </header>

      <ProfileForm
        methods={methods}
        initialValues={{
          name: profile.name,
          description: profile.description,
          methodId: profile.methodId,
          defaultRatio: profile.defaultRatio,
          defaultDoseGrams: profile.defaultDoseGrams,
          grindOffsetClicks: profile.grindOffsetClicks,
          waterTempC: profile.waterTempC,
          phases: profile.phases,
        }}
        action={updateProfile.bind(null, profile.id)}
        submitLabel="Uložit změny"
      />
    </div>
  );
}
