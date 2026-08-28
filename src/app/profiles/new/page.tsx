import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profiles/ProfileForm";

export const dynamic = "force-dynamic";

export default async function NewProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ methodId?: string }>;
}) {
  const { methodId } = await searchParams;
  const methods = await prisma.brewMethod.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-stone-100">Nový recept</h1>
        <p className="mt-1 text-sm text-stone-500">
          Dej mu název a poskládej fáze, kterými tě má appka při vaření provést.
        </p>
      </header>

      <ProfileForm methods={methods} initialMethodId={methodId} />
    </div>
  );
}
