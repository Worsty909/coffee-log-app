import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProfile } from "@/lib/actions/profiles";
import { DeleteProfileButton } from "@/components/profiles/DeleteProfileButton";
import { formatSeconds } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const methods = await prisma.brewMethod.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      profiles: {
        orderBy: { sortOrder: "asc" },
        include: { phases: { orderBy: { order: "asc" } }, _count: { select: { recipes: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-100">Recepty</h1>
          <p className="mt-1 text-sm text-stone-500">
            Recept je pojmenovaná sada fází časovače — poměr, mletí a průběh přípravy na jedno kliknutí.
          </p>
        </div>
        <Link
          href="/profiles/new"
          className="shrink-0 rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
        >
          + Nový recept
        </Link>
      </header>

      {methods.map((method) => (
        <section key={method.id}>
          <h2 className="text-sm font-semibold text-stone-300">{method.name}</h2>
          {method.profiles.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600">
              Zatím žádný recept.{" "}
              <Link href={`/profiles/new?methodId=${method.id}`} className="text-amber-500 hover:underline">
                Přidat
              </Link>
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {method.profiles.map((profile) => {
                const totalSeconds = profile.phases.reduce((sum, p) => sum + p.durationSeconds, 0);
                return (
                  <li
                    key={profile.id}
                    className="rounded-xl border border-stone-800 bg-stone-900/60 p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-stone-100">{profile.name}</p>
                      <div className="flex shrink-0 items-center gap-3">
                        <Link
                          href={`/profiles/${profile.id}/edit`}
                          className="text-xs text-stone-500 hover:text-stone-300 hover:underline"
                        >
                          Upravit
                        </Link>
                        <DeleteProfileButton action={deleteProfile.bind(null, profile.id)} />
                      </div>
                    </div>
                    {profile.description && (
                      <p className="mt-1 text-xs text-stone-500">{profile.description}</p>
                    )}
                    <p className="mt-2 text-xs tabular-nums text-stone-500">
                      {profile.phases.length} {profile.phases.length === 1 ? "fáze" : "fází"} · celkem{" "}
                      {formatSeconds(totalSeconds)}
                      {profile._count.recipes > 0 &&
                        ` · použito v ${profile._count.recipes} ${profile._count.recipes === 1 ? "receptu" : "receptech"}`}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
